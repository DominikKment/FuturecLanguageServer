import { Diagnostic, Position, TextDocument, Location, ParameterInformation, SignatureInformation, MarkupContent, SignatureHelp, TextDocuments} from 'vscode-languageserver';
import { Script } from './Script';
import { CursorPositionInformation, CursorPositionType } from './CursorPositionInformation';

export class TextParser {
	static getWordAtPosition(pos :Position, doc :TextDocument) :CursorPositionInformation{

		let offset = doc.offsetAt(pos);
		let text = doc.getText();
		let char = text.charAt(offset);
		let charAtPos = char;
		let isfunction = false;
		let isParserfunction = false;
	
		let includescriptOffset = offset;

		while((offset > 0) && (char != ' ') && (char != '\t') && (char != '\n') && 
		(char != '(') && (char != '[') && (char != '!') && (char != ',') && 
		(char != '\"') && (char != '-') && (char != '#') && (char != '$') && (char != '{') && 
		(char != ';') && (char != '}'))
		{
			if(char == ':') {
				isfunction = true;
			}
			else if(char == ".") {
				isParserfunction = true;
				break;
			}

			offset--;
			char = text.charAt(offset);
		}
		offset++;

		let start = offset;
		let patternEndOfWord = /[^a-zA-ZöÖäÄüÜß_0-9]+/g;
		patternEndOfWord.lastIndex = start + 1;
		if(isfunction) {
			patternEndOfWord.lastIndex += 5;
		}

		let m = patternEndOfWord.exec(text);

		let word = "";
		if(m) {
			word = text.substring(start, m.index);
		} else {
			word = text.substring(start);
		}

		let type = CursorPositionType.UNDEFINED_VALUE;
		if(isfunction) {
			type = CursorPositionType.USERDEFINED_FUNCTION;
		}
		else if(isParserfunction) {
			type = CursorPositionType.PARSER_FUNCTION;
		}
		else if(word == "includescript") {
			let pattern = /[0-9]+/g;
			pattern.lastIndex = includescriptOffset;

			let m = pattern.exec(text);
			if(m) {
				let patternEnd = /\b/g;
				patternEnd.lastIndex = m.index + 1;
				let m2 = patternEnd.exec(text);
				if(m2) {
					word = text.substring(m.index, m2.index);
					type = CursorPositionType.INCLUDESCRIPT;
				} else { type = CursorPositionType.ERROR; }
			} else { type = CursorPositionType.ERROR; }
		}
		else {
			type = CursorPositionType.VARIABLE;
		}

		let info :CursorPositionInformation = new CursorPositionInformation(word, charAtPos, type);

		return info;
	}


	static getLine(pos :Position, curDoc :TextDocument) :string {
		return curDoc.getText({
			end: {character: 400, line:pos.line},
			start: {character: 0, line: pos.line}
		}).trim();
	}

}
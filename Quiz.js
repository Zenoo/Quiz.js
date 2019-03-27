/* exported Quiz */

/**
 * Quiz class
 */
class Quiz{
	/**
	 * Quiz constructor
	 * @param {Object[]} questions                          Question information holder
	 * @param {String}   questions.title                    Question title
	 * @param {String}   questions.id                       Question id (must be unique)
	 * @param {Object[]} questions.answers                  Answer information holder
	 * @param {String}   questions.answers.title            Answer title
	 * @param {String}   questions.answers.value            Answer real value
	 * @param {Number}   questions.answers.chosenPercentage Answer pick percentage
	 */
	constructor(questions){
		questions = questions || [];

		/**
		 * @member {Function[]} _onAnswerCallbacks
		 * @private
		 */
		this._onAnswerCallbacks = [];
		/**
		 * @member {Function[]} _onEndCallbacks
		 * @private
		 */
		this._onEndCallbacks = [];

		this._listenToCustomEvents(questions);
	}

	/**
	 * Listen to every custom events (used for security purposes)
	 * @param {Object[]} questions The current Quiz questions
	 * @private
	 */
	_listenToCustomEvents(questions){
		document.addEventListener('quiz.js-addQuestions', ({detail}) => {
			this._addQuestionsHandler(questions, detail);
		});
	}

	/**
	 * Handler for the quiz.js-addQuestion event
	 * @param {Object[]} questions                             The current Quiz questions
	 * @param {String}   newQuestions.title                    Question title
	 * @param {String}   newQuestions.id                       Question id (must be unique)
	 * @param {Object[]} newQuestions.answers                  Answer information holder
	 * @param {String}   newQuestions.answers.title            Answer title
	 * @param {String}   newQuestions.answers.value            Answer real value
	 * @param {Number}   newQuestions.answers.chosenPercentage Answer pick percentage
	 * @private
	 */
	_addQuestionsHandler(questions, newQuestions){
		questions.push(...newQuestions.filter(n => !questions.find(q => q.id == n.id)));
	}

	/**
	 * Add new questions to the Quiz
	 * @param {Object[]} questions 
	 * @param {String}   questions.id                       Question id (must be unique)
	 * @param {Object[]} questions.answers                  Answer information holder
	 * @param {String}   questions.answers.title            Answer title
	 * @param {String}   questions.answers.value            Answer real value
	 * @param {Number}   questions.answers.chosenPercentage Answer pick percentage
	 * @returns {Quiz} The current Quiz
	 */
	addQuestions(...questions){
		document.dispatchEvent(new CustomEvent('quiz.js-addQuestions', {
			detail: questions
		}));

		return this;
	}

	/**
	 * Remove questions from the Quiz
	 * @param {String[]} ids Ids of the questions to remove
	 * @returns {Quiz} The current Quiz
	 */
	removeQuestions(...ids){
		document.dispatchEvent(new CustomEvent('quiz.js-removeQuestions', {
			detail: ids
		}));

		return this;
	}

	/**
	 * Set a time limit for each question
	 * @param {Number} time 
	 * @returns {Quiz} The current Quiz
	 */
	setTimeLimit(time){
		/**
		 * @member {Number} timeLimit Maximum time to answer a question
		 */
		this.timeLimit = time;
		
		return this;
	}

	/**
	 * Set the Quiz to run inside a DOM Element
	 * @param {String|Element} node The Element to run the Quiz in
	 * @returns {Quiz} The current Quiz
	 */
	attachTo(node){
		/**
		 * @member {Element} wrapper The element containing the Quiz
		 */
		this.wrapper = node instanceof Element ? node : document.querySelector(node);

		// TODO: Build DOM here

		return this;
	}

	/**
	 * Start the Quiz
	 * @param {Number} steps The amount of questions to go through
	 * @returns {Quiz} The current Quiz
	 */
	start(steps){
		if(this.wrapper){
			// TODO: toggle first question
		}else{
			console.warn('Quiz.js: You didn\'t specify an Element to run the Quiz in. Use %c.attachTo()%c.', 'font-weight: bold; font-family: monospace', '');
		}

		return this;
	}

	/**
	 * Callback for every Quiz answer
	 * @callback onAnswerCallback
	 * @param {String} questionId   Answered question ID
	 * @param {String} answer       Answer informations holder
	 * @param {String} answer.value Answer value
	 * @param {Number} answer.time  Answer time
	 */

	/**
	 * Add a callback
	 * @param {onAnswerCallback} callback 
	 * @returns {Quiz} The current Quiz
	 */
	onAnswer(callback){
		this._onAnswerCallbacks.push(callback);

		return this;
	}

	/**
	 * Callback for the Quiz end
	 * @callback onEndCallback
	 * @param {Object[]} questions        Question informations holder
	 * @param {String}   questions.id     Question ID
	 * @param {String}   questions.answer Answer value
	 * @param {Number}   questions.time   Answer time
	 */

	/**
	 * 
	 * @param {onEndCallback} callback 
	 * @returns {Quiz} The current Quiz
	 */
	onEnd(callback){
		this._onEndCallbacks.push(callback);

		return this;
	}

	/**
	 * Remove every onAnswer callback
	 * @returns {Quiz} The current Quiz
	 */
	offAnswer(){
		this._onAnswerCallbacks = [];

		return this;
	}

	/**
	 * Remove every onEnd callback
	 * @returns {Quiz} The current Quiz
	 */
	offEnd(){
		this._onEndCallbacks = [];

		return this;
	}
}
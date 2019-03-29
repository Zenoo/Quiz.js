/* exported Quiz */

/**
 * @typedef {Object} Question
 * @property {String}   questions.title                    Question title
 * @property {String}   questions.id                       Question id (must be unique)
 * @property {Object[]} questions.answers                  Answer information holder
 * @property {String}   questions.answers.title            Answer title
 * @property {String}   questions.answers.value            Answer real value
 * @property {Number}   questions.answers.chosenPercentage Answer pick percentage
 */

/**
 * Quiz class
 */
class Quiz{
	/**
	 * Quiz constructor
	 * @param {Question[]} questions Question list
	 */
	constructor(questions){
		questions = questions || [];

		const selectedQuestions = [];

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

		this._listenToCustomEvents(questions, selectedQuestions);
	}

	/**
	 * Listen to every custom events (used for security purposes)
	 * @param {Question[]} questions         The current Quiz questions
	 * @param {Question[]} selectedQuestions The Quiz selected questions
	 * @private
	 */
	_listenToCustomEvents(questions, selectedQuestions){
		document.addEventListener('quiz.js-addQuestions', ({detail}) => {
			this._addQuestionsHandler(questions, detail);
		});

		document.addEventListener('quiz.js-removeQuestions', ({detail}) => {
			this._removeQuestionsHandler(questions, detail);
		});

		document.addEventListener('quiz.js-start', ({detail}) => {
			selectedQuestions = this._selectQuestions(questions, detail);

			// TODO: Display first question here + attach listeners
			this._displayQuestion(selectedQuestions[0]);
		});
	}

	/**
	 * Handler for the quiz.js-addQuestion event
	 * @param {Question[]} questions    The current Quiz questions
	 * @param {Question[]} newQuestions Questions to add
	 * @private
	 */
	_addQuestionsHandler(questions, newQuestions){
		questions.push(...newQuestions.filter(n => !questions.find(q => q.id == n.id)));
	}

	/**
	 * Handler for the quiz.js-addQuestion event
	 * @param {Question[]} questions         The current Quiz questions
	 * @param {Number[]}   questionsToRemove IDs of the questions to remove
	 * @private
	 */
	_removeQuestionsHandler(questions, questionsToRemove){
		questions = questions.filter(q => !questionsToRemove.includes(q.id));
	}

	/**
	 * Select random questions at the start
	 * @param {Question[]} questions The current Quiz questions
	 * @param {Number}     steps     The amount of questions to select
	 * @private
	 */
	_selectQuestions(questions, steps){
		const selectedQuestions = [];
		let i = steps;

		while(i > 0){
			const randomPosition = Math.floor(Math.random() * steps);

			if(!selectedQuestions.includes(questions[randomPosition])){
				selectedQuestions.push(questions[randomPosition]);
				i--;
			}
		}

		return selectedQuestions;
	}

	/**
	 * Display a question in the DOM
	 * @param {Question} question 
	 * @private
	 */
	_displayQuestion(question){
		this.wrapper.querySelector('.js-quiz-question').textContent = question.aaa;
	}

	/**
	 * Add new questions to the Quiz
	 * @param {Question[]} questions Questions to add
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

		this.wrapper.classList.add('quiz-js-wrapper');
		this.wrapper.innerHTML = /*html*/`
			<div class="quiz-js-question" data-id=""></div>
			<div class="quiz-js-answers"></div>
			${this.timeLimit ? '<div class="quiz-js-time-limit"></div>' : ''}
		`;

		return this;
	}

	/**
	 * Start the Quiz
	 * @param {Number} steps The amount of questions to go through
	 * @returns {Quiz} The current Quiz
	 */
	start(steps){
		if(this.wrapper && steps > 0){
			document.dispatchEvent(new CustomEvent('quiz.js-start', {
				detail: steps
			}));
		}else{
			if(steps) console.warn('Quiz.js: You didn\'t specify an Element to run the Quiz in. Use %c.attachTo()%c.', 'font-weight: bold; font-family: monospace', '');
			else console.warn('Quiz.js: The amount of questions must be superior to 0');
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
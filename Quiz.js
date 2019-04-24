/* exported Quiz */

/**
 * @typedef {Object} Question
 * @property {String}   questions.title                    Question title
 * @property {String}   questions.id                       Question id (must be unique)
 * @property {String}   questions.answer                   Correct answer for the question (Must correspond to answers.title)
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
		 * @type {Number}
		 * @private
		 */
		this._timeLimit = null;

		/**
		 * @type {Element}
		 */
		this.wrapper = null;

		/**
		 * @type {Element}
		 * @private
		 */
		this._timer = null;

		/**
		 * @type {Number}
		 * @private
		 */
		this._timerInterval = null;

		/**
		 * @type {Date}
		 * @private
		 */
		this._timerStarted = null;

		/**
		 * @type {Object[]}
		 * @param {String}   id      Question ID
		 * @param {String}   answer  Answer value
		 * @param {Boolean}  correct Was the answer correct?
		 * @param {Number}   time    Answer time
		 */
		this.answers = [];

		/**
		 * @type {Function[]}
		 * @private
		 */
		this._onTimerStartCallbacks = [];
		/**
		 * @type {Function[]}
		 * @private
		 */
		this._onAnswerCallbacks = [];
		/**
		 * @type {Function[]}
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
			// .start(questions)
			if(isNaN(detail)){
				selectedQuestions = detail;
			}else{
				// .start(steps)
				selectedQuestions = this._selectQuestions(questions, detail > questions.length ? questions.length : detail);
			}
			

			this._displayQuestion(selectedQuestions, 0);
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
	 * @param {Question[]} questions
	 * @param {Number}     position
	 * @private
	 */
	_displayQuestion(questions, position){
		this.wrapper.querySelector('.quiz-js-question').innerHTML = questions[position].title;

		this._shuffleArray(questions[position].answers);
		this.wrapper.querySelector('.quiz-js-answers').innerHTML = questions[position].answers.map(answer => `
			<div>
				<button data-value="${answer.value}">${answer.title}</button>
			</div>
		`).join('');

		this._listenToUserAnswer(questions, position);

		if(this._timeLimit){
			this._timer.parentElement.classList.remove('quiz-js-hidden');
			this._resetTimer(questions, position);
		}

		this.wrapper.querySelector('.quiz-js-next').classList.add('quiz-js-hidden');
	}

	/**
	 * Shuffle an array
	 * @param {Array} array 
	 * @private
	 */
	_shuffleArray(array){
		for(let i = array.length - 1; i > 0; i--){
			const j = Math.floor(Math.random() * (i + 1));

			[array[i], array[j]] = [array[j], array[i]];
		}
	}

	/**
	 * Listen to user click
	 * @param {Question[]} questions
	 * @param {Number}     position
	 * @private
	 */
	_listenToUserAnswer(questions, position){
		this.wrapper.querySelectorAll('.quiz-js-answers button').forEach(answer => {
			answer.addEventListener('click', () => {
				const answerTime = new Date() - this._timerStarted;

				clearInterval(this._timerInterval);

				this.answers.push({
					id: questions[position].id,
					answer: answer.getAttribute('data-value'),
					correct: questions[position].answer == answer.getAttribute('data-value'),
					time: answerTime
				});

				this._onAnswerCallbacks.forEach(callback => {
					Reflect.apply(callback, null, [
						questions[position],
						{
							value: answer.getAttribute('data-value'),
							correct: questions[position].answer == answer.getAttribute('data-value'),
							time: answerTime
						}
					]);
				});

				this._displayQuestionInformations(questions, position, answer.getAttribute('data-value'));
			});
		});
	}

	/**
	 * Reset the timer to full time
	 * @param {Question[]} questions
	 * @param {Number}     position
	 * @private
	 */
	_resetTimer(questions, position){
		const timerText = this.wrapper.querySelector('.quiz-js-time-text');

		this._timer.style.width = '100%';
		this._timerStarted = new Date();
		timerText.textContent = (this._timeLimit / 1000).toFixed(2) + 's';

		this._onTimerStartCallbacks.forEach(callback => {
			Reflect.apply(callback, null, [this._timer.parentElement]);
		});

		this._timerInterval = setInterval(() => {
			const progress = (new Date() - this._timerStarted) / this._timeLimit;

			if(progress < 1){
				this._timer.style.width = 100 - progress * 100 + '%';
				timerText.textContent = ((this._timeLimit - this._timeLimit * progress) / 1000).toFixed(2) + 's';
			}else{
				this.answers.push({
					id: questions[position].id,
					answer: '',
					time: this._timeLimit
				});

				this._onAnswerCallbacks.forEach(callback => {
					Reflect.apply(callback, null, [
						questions[position],
						{
							value: '',
							time: this._timeLimit
						}
					]);
				});

				clearInterval(this._timerInterval);
				this._displayQuestionInformations(questions, position);
			}
		}, 10);
	}

	/**
	 * Display chosen percentage for a question
	 * @param {Question[]} questions
	 * @param {Number}     position
	 * @param {String}     [value]
	 * @private
	 */
	_displayQuestionInformations(questions, position, value = ''){
		questions[position].answers.forEach(answer => {
			const answerButton = this.wrapper.querySelector(`.quiz-js-answers button[data-value="${answer.value}"]`);

			answerButton.disabled = true;
			if(value == answer.value) answerButton.classList.add('quiz-js-answer-clicked');
			if(answer.value == questions[position].answer) answerButton.classList.add('quiz-js-answer-correct');

			answerButton.innerHTML = /*html*/`
				<span class="quiz-js-answer-percentage">${answer.chosenPercentage}%</span>
				<span>${answer.title}</span>
			`;
		});

		const nextButton = this.wrapper.querySelector('.quiz-js-next').cloneNode(true);

		this.wrapper.querySelector('.quiz-js-next').replaceWith(nextButton);
		nextButton.classList.remove('quiz-js-hidden');

		nextButton.addEventListener('click', () => {
			if(position + 1 < questions.length){
				this._displayQuestion(questions, position + 1);
			}else{
				this._displayEnd();
			}
		});
	}

	/**
	 * End panel display
	 * @private
	 */
	_displayEnd(){
		this.wrapper.querySelector('.quiz-js-question').classList.add('quiz-js-hidden');
		this.wrapper.querySelector('.quiz-js-answers').classList.add('quiz-js-hidden');
		if(this._timeLimit) this.wrapper.querySelector('.quiz-js-time-limit').classList.add('quiz-js-hidden');
		this.wrapper.querySelector('.quiz-js-next').classList.add('quiz-js-hidden');
		this.wrapper.querySelector('.quiz-js-results').classList.remove('quiz-js-hidden');

		this.wrapper.querySelector('.quiz-js-ok span').textContent = this.answers.filter(a => a.correct).length;
		this.wrapper.querySelector('.quiz-js-error span').textContent = this.answers.filter(a => !a.correct).length;

		this._onEndCallbacks.forEach(callback => {
			Reflect.apply(callback, null, [this.answers]);
		});
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
		this._timeLimit = time;
		
		return this;
	}

	/**
	 * Set the Quiz to run inside a DOM Element
	 * @param {String|Element} node The Element to run the Quiz in
	 * @returns {Quiz} The current Quiz
	 */
	attachTo(node){
		this.wrapper = node instanceof Element ? node : document.querySelector(node);

		this.wrapper.classList.add('quiz-js-wrapper');
		this.wrapper.innerHTML = /*html*/`
			<div class="quiz-js-question" data-id=""></div>
			<div class="quiz-js-answers"></div>
			${this._timeLimit ? '<div class="quiz-js-time-limit quiz-js-hidden"><div class="quiz-js-time-left"></div><div class="quiz-js-time-text"></div></div>' : ''}
			<button class="quiz-js-next quiz-js-hidden">&#10095;</button>
			<div class="quiz-js-results quiz-js-hidden">
				<p class="quiz-js-ok"><span></span> &#10004;</p>
				<p class="quiz-js-error"><span></span> &#10008;</p>
			</div>
		`;

		this._timer = this.wrapper.querySelector('.quiz-js-time-left');

		return this;
	}

	/**
	 * Start the Quiz
	 * @param {Number|Question[]} steps The amount of questions to go through OR the list of questions to ask
	 * @returns {Quiz} The current Quiz
	 */
	start(steps){
		if(this.wrapper && (!isNaN(steps) && steps > 0 || isNaN(steps) && steps.length)){
			document.dispatchEvent(new CustomEvent('quiz.js-start', {
				detail: steps
			}));
		}else{
			if(steps) console.warn('Quiz.js: You didn\'t specify an Element to run the Quiz in. Use %c.attachTo()%c.', 'font-weight: bold; font-family: monospace', '');
			else console.warn('Quiz.js: The amount of questions must be greater than 0');
		}

		return this;
	}

	/**
	 * Callback for every Quiz timer start
	 * @callback onTimerStartCallback
	 * @param {String}  timerElement   Quiz timer element
	 */

	/**
	 * Add a callback after each timer start
	 * @param {onTimerStartCallback} callback 
	 * @returns {Quiz} The current Quiz
	 */
	onTimerStart(callback){
		this._onTimerStartCallbacks.push(callback);

		return this;
	}

	/**
	 * Callback for every Quiz answer
	 * @callback onAnswerCallback
	 * @param {Object}  question       Answered question object
	 * @param {String}  answer         Answer informations holder
	 * @param {String}  answer.value   Answer value
	 * @param {Boolean} answer.correct Was the answer correct?
	 * @param {Number}  answer.time    Answer time
	 */

	/**
	 * Add a callback after each user answer
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
	 * @param {Object[]} questions         Question informations holder
	 * @param {String}   questions.id      Question ID
	 * @param {String}   questions.answer  Answer value
	 * @param {Boolean}  questions.correct Was the answer correct?
	 * @param {Number}   questions.time    Answer time
	 */

	/**
	 * Add a callback at the end of the Quiz
	 * @param {onEndCallback} callback 
	 * @returns {Quiz} The current Quiz
	 */
	onEnd(callback){
		this._onEndCallbacks.push(callback);

		return this;
	}

	/**
	 * Remove every onTimerStart callback
	 * @returns {Quiz} The current Quiz
	 */
	offTimerStart(){
		this._onTimerStartCallbacks = [];

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

	/**
	 * Reset the Quiz to its base form
	 * @returns {Quiz} The current Quiz
	 */
	reset(){
		clearInterval(this._timerInterval);
		this._timerStarted = null;
		this.answers = [];

		const
			question = this.wrapper.querySelector('.quiz-js-question'),
			answers = this.wrapper.querySelector('.quiz-js-answers');

		question.setAttribute('data-id', '');
		question.classList.remove('quiz-js-hidden');
		question.innerHTML = '';
		answers.innerHTML = '';
		answers.classList.remove('quiz-js-hidden');
		this.wrapper.querySelector('.quiz-js-time-limit').classList.add('quiz-js-hidden');
		this.wrapper.querySelector('.quiz-js-results').classList.add('quiz-js-hidden');

		return this;
	}
}
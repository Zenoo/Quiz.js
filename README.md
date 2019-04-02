# Quiz.js [(Demo)](https://jsfiddle.net/Zenoo0/tnv803w7/)

Create quizzes easily

### Doc

* **Installation**

Simply import Quiz into your HTML.
```
<script src="https://unpkg.com/quiz.js/Quiz.min.js"></script>
```
* **How to use**

Create a new [`Quiz`](https://zenoo.github.io/Quiz.js/Quiz.html) object :
```JS
let quiz = new Quiz(questions);

quiz
  .setTimeLimit(1000*20) // (Optional) Set a time limit to answer
  .attachTo('#test')     // Display the quiz in the targeted element
  .start(3);             // Start the quiz with 3 random questions
```
* **Questions**

```JS
[
  {
    id: '1+1',          // Unique question ID
    title: '1 + 1 = ?', // Actual question displayed
    answer: '2',        // Correct answer (must correspond to one of the answers' value)
    answers: [          // Answer list
      {
        title: '11',         // Answer displayed
        value: '11',         // Answer actual value
        chosenPercentage: 11 // Percentage of people who chose this answer
	  },
	  ...
    ]
  },
  ...
]
```
* **Methods**

See the [documentation](https://zenoo.github.io/Quiz.js/Quiz.html) for the method definitions. 

* **Example**

See this [JSFiddle](https://jsfiddle.net/Zenoo0/tnv803w7/) for a working example

## Authors

* **Zenoo** - *Initial work* - [Zenoo.fr](https://zenoo.fr)
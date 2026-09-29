<?php

/**
 * Demo question bank data keyed by category slug.
 *
 * Each question contains:
 * - question: string
 * - options: array of 4 option texts
 * - correct: int index (0-3) of the correct option
 * - difficulty: easy|medium|hard
 * - explanation: string
 *
 * Marks (1) and negative_marks (0.25) are applied by QuestionSeeder.
 *
 * @return array<string, array<int, array<string, mixed>>>
 */
return [
    'php' => [
        [
            'question' => 'Which keyword is used to define a class in PHP?',
            'options' => ['object', 'class', 'struct', 'define'],
            'correct' => 1,
            'difficulty' => 'easy',
            'explanation' => 'The class keyword is used to define a class in PHP. Inside the class body you declare properties and methods that describe object behavior.',
        ],
        [
            'question' => 'Which PHP function returns the number of elements in an array?',
            'options' => ['sizeof()', 'length()', 'count()', 'size()'],
            'correct' => 2,
            'difficulty' => 'easy',
            'explanation' => 'The count() function returns the number of elements in an array. It can also work with Countable objects and returns 0 for null in PHP 8+.',
        ],
        [
            'question' => 'Which visibility modifier restricts access to properties and methods within the same class only?',
            'options' => ['public', 'protected', 'private', 'static'],
            'correct' => 2,
            'difficulty' => 'easy',
            'explanation' => 'The private visibility modifier allows access only within the declaring class. Subclasses and external code cannot access private members directly.',
        ],
        [
            'question' => 'What does the final keyword prevent when applied to a class?',
            'options' => ['Instantiation of the class', 'Inheritance of the class', 'Use of static methods', 'Implementation of interfaces'],
            'correct' => 1,
            'difficulty' => 'medium',
            'explanation' => 'A class declared as final cannot be extended. When applied to a method, final prevents that method from being overridden in child classes.',
        ],
        [
            'question' => 'Which SPL interface must a class implement to be used with foreach in a custom way?',
            'options' => ['Serializable', 'Iterator', 'ArrayAccess', 'Countable'],
            'correct' => 1,
            'difficulty' => 'medium',
            'explanation' => 'The Iterator interface defines methods like current(), key(), next(), rewind(), and valid() that enable custom iteration behavior with foreach.',
        ],
        [
            'question' => 'What is the primary purpose of namespaces in PHP?',
            'options' => ['Encrypt class names', 'Avoid name collisions between classes', 'Improve runtime performance', 'Enable multiple inheritance'],
            'correct' => 1,
            'difficulty' => 'medium',
            'explanation' => 'Namespaces group related classes, interfaces, functions, and constants to prevent naming conflicts, especially when using third-party libraries.',
        ],
        [
            'question' => 'Which keyword is used to inherit from a parent class in PHP?',
            'options' => ['implements', 'inherits', 'extends', 'uses'],
            'correct' => 2,
            'difficulty' => 'easy',
            'explanation' => 'PHP uses the extends keyword for class inheritance. A child class inherits properties and methods from its parent unless visibility or overriding rules apply.',
        ],
        [
            'question' => 'What is a trait in PHP primarily used for?',
            'options' => ['Defining database schemas', 'Horizontal code reuse across classes', 'Creating anonymous functions', 'Handling HTTP requests'],
            'correct' => 1,
            'difficulty' => 'medium',
            'explanation' => 'Traits allow reusable method definitions to be included in multiple classes, addressing code reuse limitations in PHP\'s single-inheritance model.',
        ],
        [
            'question' => 'What does the instanceof operator check?',
            'options' => ['Whether two variables share memory', 'Whether an object is an instance of a class or interface', 'Whether a file exists', 'Whether a function is callable'],
            'correct' => 1,
            'difficulty' => 'easy',
            'explanation' => 'The instanceof operator returns true if the given object is an instance of the specified class, subclass, or implements the given interface.',
        ],
        [
            'question' => 'Which construct is used to handle exceptions in PHP?',
            'options' => ['if/else', 'switch/case', 'try/catch', 'for/foreach'],
            'correct' => 2,
            'difficulty' => 'easy',
            'explanation' => 'Exceptions are handled using try/catch blocks. Code in the try block runs normally, and if an exception is thrown, execution jumps to the matching catch block.',
        ],
    ],
    'laravel' => [
        [
            'question' => 'Which file is the default location for defining web routes in Laravel?',
            'options' => ['routes/api.php', 'routes/web.php', 'routes/console.php', 'bootstrap/app.php'],
            'correct' => 1,
            'difficulty' => 'easy',
            'explanation' => 'Laravel defines browser-facing routes in routes/web.php by default. API routes are typically placed in routes/api.php.',
        ],
        [
            'question' => 'What is the primary purpose of middleware in Laravel?',
            'options' => ['Compile Blade templates', 'Filter and inspect HTTP requests before they reach the application', 'Generate database migrations', 'Store session data in Redis only'],
            'correct' => 1,
            'difficulty' => 'medium',
            'explanation' => 'Middleware provides a mechanism for filtering HTTP requests entering your application, such as authentication, CSRF protection, and rate limiting.',
        ],
        [
            'question' => 'Which Laravel component is used as the default ORM for database interactions?',
            'options' => ['Query Builder only', 'Eloquent', 'Doctrine ORM', 'PDO Wrapper'],
            'correct' => 1,
            'difficulty' => 'easy',
            'explanation' => 'Eloquent is Laravel\'s built-in ORM. Each database table has a corresponding Model that allows you to interact with records using an object-oriented syntax.',
        ],
        [
            'question' => 'Which Artisan command executes pending database migrations?',
            'options' => ['php artisan db:seed', 'php artisan migrate', 'php artisan make:migration', 'php artisan schema:dump'],
            'correct' => 1,
            'difficulty' => 'easy',
            'explanation' => 'The php artisan migrate command runs all pending migrations, applying schema changes defined in the database/migrations directory.',
        ],
        [
            'question' => 'What is the Laravel Service Container primarily responsible for?',
            'options' => ['Rendering Blade views', 'Managing class dependencies and dependency injection', 'Sending queued emails', 'Caching configuration files'],
            'correct' => 1,
            'difficulty' => 'medium',
            'explanation' => 'The service container is Laravel\'s powerful tool for managing class dependencies and performing dependency injection throughout the application.',
        ],
        [
            'question' => 'Which templating engine is included with Laravel by default?',
            'options' => ['Twig', 'Smarty', 'Blade', 'Mustache'],
            'correct' => 2,
            'difficulty' => 'easy',
            'explanation' => 'Blade is Laravel\'s simple yet powerful templating engine. Blade templates are compiled into plain PHP and cached for performance.',
        ],
        [
            'question' => 'Which method on the Illuminate\Http\Request object is commonly used to validate incoming data?',
            'options' => ['sanitize()', 'validate()', 'filter()', 'check()'],
            'correct' => 1,
            'difficulty' => 'medium',
            'explanation' => 'The validate() method on the request object validates incoming data against defined rules and automatically throws a validation exception on failure.',
        ],
        [
            'question' => 'Which Laravel feature transforms Eloquent models into structured JSON API responses?',
            'options' => ['Form Requests', 'API Resources', 'Policies', 'Observers'],
            'correct' => 1,
            'difficulty' => 'hard',
            'explanation' => 'API Resources provide a transformation layer between Eloquent models and the JSON responses returned to API consumers, keeping controllers clean.',
        ],
    ],
    'javascript' => [
        [
            'question' => 'Which keyword declares a block-scoped variable that can be reassigned?',
            'options' => ['var', 'let', 'const', 'static'],
            'correct' => 1,
            'difficulty' => 'easy',
            'explanation' => 'The let keyword declares a block-scoped local variable. Unlike var, let is not hoisted in a way that allows use before declaration without error.',
        ],
        [
            'question' => 'What does a Promise represent in JavaScript?',
            'options' => ['A synchronous function call', 'The eventual completion or failure of an asynchronous operation', 'A compiled JavaScript module', 'A DOM element reference'],
            'correct' => 1,
            'difficulty' => 'medium',
            'explanation' => 'A Promise is an object representing the eventual result of an asynchronous operation, which may resolve with a value or reject with a reason.',
        ],
        [
            'question' => 'What does the async keyword do when applied to a function?',
            'options' => ['Makes the function run on a separate thread', 'Makes the function always return a Promise', 'Prevents the function from throwing errors', 'Converts callbacks into generators'],
            'correct' => 1,
            'difficulty' => 'medium',
            'explanation' => 'An async function always returns a Promise. Inside it, await can be used to pause execution until a Promise settles.',
        ],
        [
            'question' => 'Which array method creates a new array by calling a function on every element?',
            'options' => ['filter()', 'map()', 'reduce()', 'find()'],
            'correct' => 1,
            'difficulty' => 'easy',
            'explanation' => 'The map() method creates a new array populated with the results of calling a provided function on every element in the calling array.',
        ],
        [
            'question' => 'What is a closure in JavaScript?',
            'options' => ['A function with no parameters', 'A function that remembers variables from its outer lexical scope', 'A built-in browser API', 'A type of loop structure'],
            'correct' => 1,
            'difficulty' => 'medium',
            'explanation' => 'A closure is a function bundled together with its lexical environment, allowing the inner function to access variables from the outer function even after the outer function has returned.',
        ],
        [
            'question' => 'What does array destructuring allow you to do?',
            'options' => ['Sort arrays in place', 'Extract values from arrays into distinct variables', 'Convert arrays to objects', 'Remove duplicate values'],
            'correct' => 1,
            'difficulty' => 'easy',
            'explanation' => 'Array destructuring provides a concise syntax to unpack values from arrays (or properties from objects) into distinct variables in a single statement.',
        ],
        [
            'question' => 'What does the spread operator (...) do when used with an array?',
            'options' => ['Deletes array elements', 'Expands an iterable into individual elements', 'Freezes the array', 'Sorts the array alphabetically'],
            'correct' => 1,
            'difficulty' => 'easy',
            'explanation' => 'The spread operator expands an iterable such as an array into individual elements, useful for copying arrays, merging arrays, or passing arguments to functions.',
        ],
    ],
    'react' => [
        [
            'question' => 'What is a React component?',
            'options' => ['A CSS stylesheet for UI styling', 'A reusable piece of UI that returns elements to render', 'A database model for frontend data', 'A Node.js server route handler'],
            'correct' => 1,
            'difficulty' => 'easy',
            'explanation' => 'A React component is a reusable building block that accepts inputs (props) and returns React elements describing what should appear on the screen.',
        ],
        [
            'question' => 'What are props in React used for?',
            'options' => ['To store internal mutable state', 'To pass data from a parent component to a child component', 'To define CSS class names', 'To configure webpack loaders'],
            'correct' => 1,
            'difficulty' => 'easy',
            'explanation' => 'Props (short for properties) are read-only inputs passed from parent to child components, enabling reusable and configurable UI elements.',
        ],
        [
            'question' => 'Which hook is used to add local state to a functional component?',
            'options' => ['useEffect', 'useState', 'useContext', 'useRef'],
            'correct' => 1,
            'difficulty' => 'easy',
            'explanation' => 'useState returns a state value and a setter function, allowing functional components to manage local state across re-renders.',
        ],
        [
            'question' => 'What is the primary purpose of the useEffect hook?',
            'options' => ['Memoize expensive calculations', 'Run side effects after render', 'Create DOM references', 'Share state globally'],
            'correct' => 1,
            'difficulty' => 'medium',
            'explanation' => 'useEffect lets you synchronize a component with external systems by running side effects such as data fetching, subscriptions, or manual DOM updates after render.',
        ],
        [
            'question' => 'When should useMemo be used in React?',
            'options' => ['To memoize expensive computed values between renders', 'To replace useState entirely', 'To fetch data from an API', 'To define component lifecycle methods'],
            'correct' => 0,
            'difficulty' => 'hard',
            'explanation' => 'useMemo memoizes the result of a computation and only recalculates it when one of its dependencies changes, helping avoid expensive recalculations on every render.',
        ],
    ],
    'mysql' => [
        [
            'question' => 'Which SQL clause is used to retrieve data from one or more tables?',
            'options' => ['INSERT', 'SELECT', 'UPDATE', 'DELETE'],
            'correct' => 1,
            'difficulty' => 'easy',
            'explanation' => 'The SELECT statement is used to query and retrieve rows and columns from database tables based on specified conditions.',
        ],
        [
            'question' => 'Which type of JOIN returns only rows where there is a match in both tables?',
            'options' => ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'CROSS JOIN'],
            'correct' => 2,
            'difficulty' => 'medium',
            'explanation' => 'An INNER JOIN returns rows that have matching values in both joined tables. Non-matching rows from either table are excluded from the result.',
        ],
        [
            'question' => 'What is the purpose of a PRIMARY KEY in a MySQL table?',
            'options' => ['To encrypt row data', 'To uniquely identify each row in the table', 'To sort rows alphabetically', 'To automatically create foreign keys'],
            'correct' => 1,
            'difficulty' => 'easy',
            'explanation' => 'A PRIMARY KEY uniquely identifies each record in a table. MySQL enforces uniqueness and typically creates a clustered index on the primary key column(s).',
        ],
        [
            'question' => 'What does a FOREIGN KEY enforce in a relational database?',
            'options' => ['Automatic indexing of all columns', 'Referential integrity between related tables', 'Case-insensitive string comparisons', 'Automatic backup of rows'],
            'correct' => 1,
            'difficulty' => 'medium',
            'explanation' => 'A FOREIGN KEY constraint links a column to a primary key in another table, ensuring referential integrity by preventing orphaned records.',
        ],
        [
            'question' => 'Which SQL clause is used to group rows that share the same values into summary rows?',
            'options' => ['ORDER BY', 'GROUP BY', 'HAVING', 'DISTINCT'],
            'correct' => 1,
            'difficulty' => 'medium',
            'explanation' => 'GROUP BY groups rows with the same values in specified columns, often used with aggregate functions like COUNT(), SUM(), or AVG().',
        ],
    ],
    'html-css' => [
        [
            'question' => 'Which HTML element is most appropriate for the main content of a document?',
            'options' => ['<div>', '<section>', '<main>', '<article>'],
            'correct' => 2,
            'difficulty' => 'easy',
            'explanation' => 'The <main> element represents the dominant content of the body. There should be only one main element per page for semantic clarity and accessibility.',
        ],
        [
            'question' => 'Which CSS property is used to create a flexible one-dimensional layout?',
            'options' => ['float', 'position', 'display: flex', 'display: block'],
            'correct' => 2,
            'difficulty' => 'easy',
            'explanation' => 'display: flex turns an element into a flex container, enabling flexible alignment and distribution of space among items along a single axis.',
        ],
        [
            'question' => 'In CSS, which selector has the highest specificity among these options?',
            'options' => ['element selector (p)', 'class selector (.title)', 'ID selector (#header)', 'universal selector (*)'],
            'correct' => 2,
            'difficulty' => 'medium',
            'explanation' => 'ID selectors have higher specificity than class selectors, which in turn have higher specificity than element selectors. This determines which rule wins in conflicts.',
        ],
    ],
    'typescript' => [
        [
            'question' => 'What is the main benefit of using TypeScript over plain JavaScript?',
            'options' => ['It runs faster in all browsers without compilation', 'It adds static type checking at compile time', 'It replaces the need for React', 'It eliminates the need for npm packages'],
            'correct' => 1,
            'difficulty' => 'medium',
            'explanation' => 'TypeScript is a superset of JavaScript that adds optional static typing. Type errors are caught during compilation, improving maintainability in large codebases.',
        ],
    ],
    'python' => [
        [
            'question' => 'Which keyword is used to define a function in Python?',
            'options' => ['func', 'function', 'def', 'lambda only'],
            'correct' => 2,
            'difficulty' => 'easy',
            'explanation' => 'The def keyword is used to define a named function in Python. Anonymous functions can be created with lambda, but def is the standard function definition syntax.',
        ],
    ],
];

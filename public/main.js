// ==========================================
//            🛠️ Navegación TABS
// ==========================================
let currentExercise = 1;

class TabHeader extends HTMLElement {
    constructor() {
        // Always call super first in constructor
        super();
    }

    connectedCallback() {
        // When the element is first connected to the document's DOM
        const links = this.querySelectorAll('a');

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                links.forEach(link => {
                    link.classList.remove('active');
                });

                link.classList.add('active');

                const activeTab = document.querySelector(link.getAttribute('href'));
                const tabs = document.querySelectorAll('.tab-content');
                const tabsContainer = document.querySelector('#tabs-container');
                const lastChild = document.querySelector('#tabs-container>div:last-child');
                const cmdInput = document.getElementById('cmd-input');

                tabs.forEach(tab => {
                    tab.classList.add('hidden');
                });

                currentExercise = parseInt(link.getAttribute('data-exercise'));

                cmdInput.value = '';

                if (currentExercise === 4 || currentExercise === 7) {
                    tabsContainer.classList.remove('lg:grid-cols-2');
                    tabsContainer.classList.add('lg:grid-cols-1');

                    lastChild.classList.remove('lg:ps-10');

                    cmdInput.removeAttribute('maxlength');
                }else {
                    tabsContainer.classList.remove('lg:grid-cols-1');
                    tabsContainer.classList.add('lg:grid-cols-2');

                    lastChild.classList.add('lg:ps-10');

                    activeTab.classList.remove('hidden');

                    cmdInput.setAttribute('maxlength', '20');
                }

                // Guardar en el LocalStorage el ejercicio actual
                localStorage.setItem('currentExercise', currentExercise);
            });
        });

        // Obtener el ejercicio actual del LocalStorage
        const exercise = localStorage.getItem('currentExercise');

        if (exercise) {
            currentExercise = parseInt(exercise);
            const activeLink = this.querySelector(`a[data-exercise="${currentExercise}"]`);
            activeLink.click();
        }
    }
}

customElements.define('tab-header', TabHeader);

// ==========================================
//          💻 Consola de Comandos
// ==========================================
const cmd = document.getElementById('cmd');
const cmdInput = document.getElementById('cmd-input');

/**
 * Crea una nueva línea de comando en la consola.
 * @param command {string} - Comando a mostrar.
 */
function newCommandLine(command, args=null) {
    const cmdTemplate = document.getElementById('cmd-template');
    const lastElement = cmd.lastElementChild;
    const clone = cmdTemplate.cloneNode(true);
    const lastCommand = getLastCommand();

    clone.classList.remove('hidden');
    clone.classList.add('flex', 'flex-col');
    clone.setAttribute('id', 'cmd-last-command');

    if (lastCommand) lastCommand.removeAttribute('id');

    clone.querySelector('.cmd-command').textContent = command + (args ? ` ${args.join(' ')}` : '');

    cmd.insertBefore(clone, lastElement);
}

/**
 * Escribe un texto en la consola de comandos.
 * @param element - Elemento donde se escribirá el texto.
 * @param arrayText - Array de textos a escribir.
 * @param onCompleteCallback - Callback que se ejecutará al finalizar la escritura.
 * @param typeSpeed - Velocidad de escritura.
 * @param delaySpeed - Velocidad de espera entre cada texto.
 */
function typeWriter(element, arrayText, onCompleteCallback, typeSpeed=40, delaySpeed=1000) {
    hiddeCMDInput();

    let strings = '';
    if (arrayText) {
        strings = arrayText.join(` ^${delaySpeed} <br> `);
    }

    const typed = new Typed(element, {
        strings: [strings],
        typeSpeed,
        backSpeed: 0,
        onComplete: (self) => {
            self.cursor.remove();

            if (onCompleteCallback) setTimeout(onCompleteCallback, 500);
        },
    });
}

/**
 * Esconde el input de la consola de comandos.
 */
function hiddeCMDInput() {
    const cmdInputContainer = document.getElementById('cmd-input-container');
    cmdInputContainer.classList.remove('flex');
    cmdInputContainer.classList.add('hidden');
}

/**
 * Muestra el input de la consola de comandos.
 */
function showCMDInput() {
    const cmdInputContainer = document.getElementById('cmd-input-container');
    cmdInputContainer.classList.remove('hidden');
    cmdInputContainer.classList.add('flex');
    cmdInputContainer.querySelector('input').focus();
}

/**
 * Limpia la consola de comandos.
 */
function clearCMD() {
    const cmd = document.getElementById('cmd');
    const cmdChildren = Array.from(cmd.children);

    cmdChildren.forEach((child) => {
        if (child.id === '' || (child.id !== 'cmd-template' && child.id !== 'cmd-input-container')) {
            child.remove();
        }
    });
}

/**
 * Obtiene el último comando de la consola.
 * @returns {HTMLElement} - Elemento del último comando.
 */
function getLastCommand() {
    return document.getElementById('cmd-last-command');
}

function commandNotFound() {
    typeWriter(
        getLastCommand().querySelector('.cmd-output'),
        ['<span class="text-red-400">⚠️ Command not found. Type "help" to get started!</span>'],
        showCMDInput,
        25,
        500
    );
}

cmd.addEventListener('click', () => { cmdInput.focus(); });

cmdInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        let tempValue = cmdInput.value.split(' ');
        const cmd = tempValue[0].toLowerCase();
        const args = tempValue.slice(1);

        cmdInput.value = '';

        hiddeCMDInput();
        newCommandLine(cmd);

        let arrayText;
        let lastCommand = getLastCommand();

        if (cmd === 'help') {
            arrayText = [
                '<span class="text-green-500">Available commands:</span>',
                'help - Show this message',
                'clear - Clear the terminal',
                'about - Show information about the author'
            ];

            if (currentExercise !== 7) {
                arrayText.push('run - Execute the current exercise, you can add arguments if necessary.');
            }

            if (currentExercise === 2) {
                arrayText.push('reset - Reset the current exercise');
            }

            if (currentExercise === 7) {
                arrayText.push('add {TASK} - Add a new task to the list');
                arrayText.push('complete {TASK_ID} - Mark a task as completed');
                arrayText.push('remove {TASK_ID} - Remove a task from the list');
                arrayText.push('list - Show the list of tasks');
                arrayText.push('<br><span class="text-violet-500">🔥 Tip: Tasks cannot have the same name.</span>');
            }

        }else if (cmd === 'clear') {
            clearCMD();
            newCommandLine(cmd);
            lastCommand = getLastCommand();

            arrayText = ['<span class="text-violet-400">✨ Terminal cleared!</span>'];
        }else if(cmd === 'run') {
            switch (currentExercise) {
                case 1: exercise1(true); break;
                case 2: exercise2(true, false); break;
                case 3: exercise3(true); break;
                case 4: exercise4(); break;
                case 5: exercise5(true); break;
                case 6: exercise6(true); break;
                default: commandNotFound(); break;
            }

            return;
        }else if(currentExercise === 7) {
            if (cmd === 'add' || cmd === 'complete' || cmd === 'remove' || cmd === 'list') {
                exercise7(cmd, args);
                return;
            }

            commandNotFound();
        } else if(cmd === 'reset') {
            switch (currentExercise) {
                case 2: exercise2(true, true); break;
                default: commandNotFound(); break;
            }

            return;
        }else if(cmd === 'about') {
            arrayText = [
                '<span class="text-green-500">👨‍💻 About the author:</span>',
                'Name: Mario Perdiguero Barrera',
                'Course: 2º DAW',
                'Subject: DWEC',
                'School: SAFA Seville, Spain',
                'Year: 2024/2025',
            ];
        } else {
            arrayText = ['<span class="text-red-400">⚠️ Command not found. Type "help" to get started!</span>'];
        }

        typeWriter(
            lastCommand.querySelector('.cmd-output'),
            arrayText,
            showCMDInput,
            25,
            500
        );
    }
});

// ==========================================
//              1️⃣ Ejercicio 1
// ==========================================
const btnSend1 = document.querySelector('#btn-send-1');

function exercise1(originConsole) {
    const phrase = document.querySelector('.phrase-1').value;
    const words = phrase.split(' ');
    let arrayText;

    if (!originConsole) newCommandLine('run');

    if (words.length >= 5) {
        arrayText = ['<span class="text-green-500">✨ Frase válida!</span>'];

        const vowels = ['a', 'e', 'i', 'o', 'u'];
        const phraseVowels = words.map((word) => {
            return word.split('').map((letter) => {
                return vowels.includes(letter.toLowerCase()) ? '*' : letter;
            }).join('');
        }).join(' ');

        arrayText.push(`La frase con las vocales ocultas es: <span class="text-blue-400">${phraseVowels}</span>`);

        const phraseUnderscore = words.map((word) => {
            return word.split('').map((letter, index) => {
                if ((index + 1) % 2 === 0) return '_';
                return letter;
            }).join('');
        }).join(' ');

        arrayText.push(`La frase remplazando las posiciones pares: <span class="text-blue-400">${phraseUnderscore}</span>`);
    } else {
        arrayText = ['<span class="text-red-400">⚠️ La frase debe contener al menos 5 palabras.</span>'];
    }

    typeWriter(
        getLastCommand().querySelector('.cmd-output'),
        arrayText,
        showCMDInput,
        25,
        500
    );
}

btnSend1.addEventListener('click', () => exercise1(false));

// ==========================================
//              2️⃣ Ejercicio 2
// ==========================================
const btnSend2 = document.querySelector('#btn-send-2');
const btnSearch = document.querySelector('#btn-search-word');
let currentPhase = 1;
let correctWords = [];

function exercise2(originConsole, reset = false) {
    const phrase = document.querySelector('.phrase-2').value;
    const wordContainer = document.querySelector('#search-word-container');
    const words = phrase.split(' ');
    let arrayText;

    if (!originConsole) {
        const command = reset ? 'reset' : 'run';
        newCommandLine(command);
    }

    if (!reset && words.length >= 7) {
        if (currentPhase === 1) {
            arrayText = ['<span class="text-violet-500">Ejecutando fase 1...</span><br>'];
            arrayText.push('<span class="text-green-500">✨ Frase válida!</span><br>');

            correctWords = words.filter((word) => word.length > 4);

            correctWords = correctWords.sort();

            arrayText.push(`Las palabras con más de 4 letras ordenadas alfabéticamente son: <span class="text-blue-400">${correctWords.join(', ')}</span>`);

            const phraseInput = document.querySelector('.phrase-2');
            phraseInput.setAttribute('disabled', 'true');

            wordContainer.classList.remove('hidden');
            wordContainer.classList.add('flex');

            btnSend2.textContent = 'Resetear';
            btnSend2.classList.remove('bg-blue-500');
            btnSend2.classList.add('bg-red-500');
            btnSend2.setAttribute('data-reset', 'true');

            currentPhase = 2;
        }else if (currentPhase === 2) {
            const searchWord = document.querySelector('.search-word').value;

            arrayText = ['<span class="text-violet-500">Ejecutando fase 2...</span><br>'];

            if(searchWord === '') {
                arrayText.push('<span class="text-red-400">⚠️ Debes ingresar una palabra para buscarla o añadirla.</span>');
            }else if (correctWords.includes(searchWord)) {
                const numberOccurrences = words.filter((word) => word === searchWord).length;
                arrayText.push(`<span class="text-green-500">✨ Palabra encontrada un total de ${numberOccurrences} ${numberOccurrences === 1 ? 'vez' : 'veces'}!</span>`);
            }else {
                arrayText.push('<span class="text-red-400">⚠️ La palabra no se encuentra en la lista, se va a añadir</span><br>');

                correctWords.push(searchWord);
                correctWords = correctWords.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

                arrayText.push(`La lista actualizada es: <span class="text-blue-400">${correctWords.join(', ')}</span>`);
            }
        }
    }else if (!reset) {
        arrayText = ['<span class="text-red-400">⚠️ La frase debe contener al menos 7 palabras.</span>'];
    }

    if (reset) {
        currentPhase = 1;
        correctWords = [];
        arrayText = ['<span class="text-violet-500">✨ Ejercicio reiniciado!</span>'];

        const phraseInput = document.querySelector('.phrase-2');
        phraseInput.removeAttribute('disabled');

        wordContainer.classList.remove('flex');
        wordContainer.classList.add('hidden');

        btnSend2.textContent = 'Enviar';
        btnSend2.classList.remove('bg-red-500');
        btnSend2.classList.add('bg-blue-500');
        btnSend2.setAttribute('data-reset', 'false');
    }

    typeWriter(
        getLastCommand().querySelector('.cmd-output'),
        arrayText,
        showCMDInput,
        25,
        500
    );
}

btnSend2.addEventListener('click', () => {
    const reset = btnSend2.getAttribute('data-reset') === 'true';
    exercise2(false, reset);
});
btnSearch.addEventListener('click', () => exercise2(false));

// ==========================================
//              3️⃣ Ejercicio 3
// ==========================================
const btnSend3 = document.querySelector('#btn-send-3');
const studentNameInput = document.querySelector('.student-name');
const students = [];

class Student {
    constructor(name, grade) {
        this.name = name;
        this.grade = grade;
    }
}

function exercise3(originConsole) {
    const studentName = document.querySelector('.student-name').value;
    const studentGrade = document.querySelector('.student-grade').value;
    let arrayText;

    if (!originConsole) newCommandLine('run');

    if (studentName === '' || studentGrade === '' || isNaN(studentGrade) || studentGrade < 0 || studentGrade > 10) {
        arrayText = ['<span class="text-red-400">⚠️ Debes ingresar un nombre y una calificación (0-10).</span>'];
    }else {
        const existingStudent = students.find((student) => student.name.toLowerCase().localeCompare(studentName.toLowerCase()) === 0);

        if (existingStudent) {
            arrayText = [`<span class="text-green-500">✨ El estudiante ${existingStudent.name} tiene una calificación de ${existingStudent.grade}.</span>`];
        }else {
            const newStudent = new Student(studentName, studentGrade);
            students.push(newStudent);

            arrayText = [`<span class="text-green-500">✨ Estudiante ${newStudent.name} añadido correctamente con una calificación de ${newStudent.grade}.</span>`];
        }
    }


    if (students.length > 0) {
        // Mostrar la nota media de todos los estudiantes
        const averageGrade = students.reduce((acc, student) => acc + parseFloat(student.grade), 0) / students.length;
        arrayText.push(`La nota media de los estudiantes es: <span class="text-blue-400">${averageGrade.toFixed(2)}</span>`);

        // Mostrar los nombres de los estudiantes por orden alfabético
        const studentsNames = students.map((student) => student.name).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        arrayText.push(`Los estudiantes registrados son: <span class="text-blue-400">${studentsNames.join(', ')}</span>`);
    }

    studentNameInput.value = '';
    document.querySelector('.student-grade').value = '';

    typeWriter(
        getLastCommand().querySelector('.cmd-output'),
        arrayText,
        showCMDInput,
        25,
        500
    );
}

btnSend3.addEventListener('click', () => exercise3(false));
studentNameInput.addEventListener(('input'), () => {
    const studentName = document.querySelector('.student-name').value;
    const existingStudent = students.find((student) => student.name.toLowerCase().localeCompare(studentName.toLowerCase()) === 0);
    btnSend3.textContent = existingStudent ? 'Mostrar calificación' : 'Añadir alumno';

    const studentGrade = document.querySelector('.student-grade');
    if (existingStudent) {
        studentGrade.value = existingStudent.grade;
        studentGrade.classList.add('bg-gray-300');
        studentGrade.setAttribute('disabled', 'true');
    }else {
        studentGrade.value = '';
        studentGrade.classList.remove('bg-gray-300');
        studentGrade.removeAttribute('disabled');
    }
});

// ==========================================
//              4️⃣ Ejercicio 4
// ==========================================
function exercise4() {
    const multiplesOf2 = [];
    const multiplesOf3 = [];

    for (let i = 1; i <= 30; i++) {
        if (i % 2 === 0) multiplesOf2.push(i);
        if (i % 3 === 0) multiplesOf3.push(i);
    }

    // Resultado de la unión de ambos conjuntos
    const union = multiplesOf2.concat(multiplesOf3);

    // Resultado de la intersección de ambos conjuntos
    const intersection = multiplesOf2.filter((value) => multiplesOf3.includes(value));

    // Resultado de la diferencia del primero menos el segundo
    const difference = multiplesOf2.filter((value) => !multiplesOf3.includes(value));

    // Resultado de la diferencia del segundo menos el primero
    const difference2 = multiplesOf3.filter((value) => !multiplesOf2.includes(value));

    // Resultado de la exclusión de los elementos que pertenecen a ambos conjuntos
    const exclusion = multiplesOf2.filter((value) => !multiplesOf3.includes(value)).concat(multiplesOf3.filter((value) => !multiplesOf2.includes(value))).sort((a, b) => a - b);

    const arrayText = [
        '<span class="text-green-500">✨ Conjunto de números múltiplos de 2:</span>',
        multiplesOf2.join(', '),
        '<br><span class="text-green-500">✨ Conjunto de números múltiplos de 3:</span>',
        multiplesOf3.join(', '),
        '<br><span class="text-green-500">✨ Unión de ambos conjuntos:</span>',
        union.join(', '),
        '<br><span class="text-green-500">✨ Intersección de ambos conjuntos:</span>',
        intersection.join(', '),
        '<br><span class="text-green-500">✨ Diferencia del primero menos el segundo:</span>',
        difference.join(', '),
        '<br><span class="text-green-500">✨ Diferencia del segundo menos el primero:</span>',
        difference2.join(', '),
        '<br><span class="text-green-500">✨ Exclusión de los elementos que pertenecen a ambos conjuntos:</span>',
        exclusion.join(', ')
    ];

    typeWriter(
        getLastCommand().querySelector('.cmd-output'),
        arrayText,
        showCMDInput,
        15,
        250
    );
}

// ==========================================
//              5️⃣ Ejercicio 5
// ==========================================
const btnSend5 = document.querySelector('#btn-send-5');

function exercise5(originConsole) {
    const numbers = document.querySelector('.numbers').value.split(',').map((number) => parseInt(number));
    let arrayText;

    if (!originConsole) newCommandLine('run');

    if (numbers.length <= 1 || numbers.filter((number) => isNaN(number)).length > 0) {
        arrayText = ['<span class="text-red-400">⚠️ Debes ingresar un mínimo de dos números o alguno de los elementos no es un número.</span>'];
    }else {
        const uniqueNumbers = numbers.filter((number) => numbers.filter((num) => num === number).length === 1);
        const average = uniqueNumbers.reduce((acc, number) => acc + number, 0) / uniqueNumbers.length;

        arrayText = [
            `<span class="text-green-500">✨ Números únicos: ${uniqueNumbers.length === 0 ? 'Sin datos' : uniqueNumbers.join(', ')} </span>`,
            `<br><span class="text-green-500">✨ Media de los números únicos:</span> <span class="text-blue-400">${uniqueNumbers.length === 0 ? '0.00' : average.toFixed(2)}</span>`
        ];
    }

    typeWriter(
        getLastCommand().querySelector('.cmd-output'),
        arrayText,
        showCMDInput,
        25,
        500
    );
}

btnSend5.addEventListener('click', () => exercise5(false));

// ==========================================
//              6️⃣ Ejercicio 6
// ==========================================
const btnSend6 = document.querySelector('#btn-send-6');

function exercise6(originConsole) {
    const phrase = document.querySelector('.phrase-6').value;
    let arrayText;

    if (!originConsole) newCommandLine('run');

    if (phrase === '') {
        arrayText = ['<span class="text-red-400">⚠️ Debes ingresar una frase o una palabra.</span>'];
    }else {
        const cleanPhrase = phrase
            .normalize('NFD') // Eliminar tildes
            .replace(/[\u0300-\u036f]/g, '') // Eliminar tildes
            .replace(/[^a-zA-Z]/g, '') // Eliminar caracteres no alfabéticos
            .toLowerCase(); // Convertir a minúsculas
        const reversePhrase = cleanPhrase.split('').reverse().join('');
        const isPalindrome = cleanPhrase === reversePhrase;


        arrayText = [
            `<span class="text-green-500">✨ La frase "${phrase}" ${isPalindrome ? 'es' : 'no es'} un palíndromo.</span>`
        ];
    }

    typeWriter(
        getLastCommand().querySelector('.cmd-output'),
        arrayText,
        showCMDInput,
        25,
        500
    );
}

btnSend6.addEventListener('click', () => exercise6(false));

// ==========================================
//              7️⃣ Ejercicio 7
// ==========================================
let tasks = [];
let lastTaskId = 0;

class Task {
    constructor(name) {
        this.id = ++lastTaskId;
        this.name = name;
        this.completed = false;
    }
}

function exercise7(command, args) {
    let arrayText;

    switch (command) {
        case 'add':
            const taskName = args.join(' ');

            if (taskName === '') {
                arrayText = ['<span class="text-red-400">⚠️ Debes ingresar un nombre para la tarea.</span>'];
            }else {
                const existingTask = tasks.find((task) => task.name.toLowerCase().localeCompare(taskName.toLowerCase()) === 0);

                if (existingTask) {
                    arrayText = ['<span class="text-red-400">⚠️ Ya existe una tarea con ese nombre.</span>'];
                }else {
                    const newTask = new Task(taskName);
                    tasks.push(newTask);

                    arrayText = [`<span class="text-green-500">✨ Tarea "${newTask.name}" añadida correctamente con el ID ${newTask.id}.</span>`];
                }
            }

            break;
        case 'complete':
            const taskId = parseInt(args[0]);
            const task = tasks.find((task) => task.id === taskId);

            if (isNaN(taskId) || !task) {
                arrayText = ['<span class="text-red-400">⚠️ Debes ingresar un ID válido.</span>'];
            }else {
                task.completed = true;
                arrayText = [`<span class="text-green-500">✨ Tarea "${task.name}" completada correctamente.</span>`];
            }

            break;
        case 'remove':
            const taskIdRemove = parseInt(args[0]);
            const taskRemove = tasks.find((task) => task.id === taskIdRemove);

            if (isNaN(taskIdRemove) || !taskRemove) {
                arrayText = ['<span class="text-red-400">⚠️ Debes ingresar un ID válido.</span>'];
            }else {
                tasks = tasks.filter((task) => task.id !== taskIdRemove);
                arrayText = [`<span class="text-green-500">✨ Tarea "${taskRemove.name}" eliminada correctamente.</span>`];
            }

            break;
        case 'list':
            if (tasks.length === 0) {
                arrayText = ['<span class="text-blue-400">📝 No hay tareas registradas.</span>'];
            }else {
                arrayText = ['<span class="text-green-500">✨ Lista de tareas:</span>'];
                tasks.forEach((task) => {
                    arrayText.push(`<span class="${task.completed ? 'line-through text-gray-400' : 'text-blue-400'}">${task.id}. ${task.name}</span>`);
                });
            }

            break;
        default: commandNotFound(); return;
    }

    typeWriter(
        getLastCommand().querySelector('.cmd-output'),
        arrayText,
        showCMDInput,
        25,
        500
    );
}

// ==========================================
//              Inicialización
// ==========================================
typeWriter(
    '#cmd-start-msg',
    [
        'Welcome to Mario-AI Terminal v1.0',
        'System Initializing...',
        'Loading Modules...',
        'All systems operational!',
        'Type "help" to get started!'
    ],
    showCMDInput,
    10,
    300
);
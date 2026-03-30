/**
 * Bunny's Toy Box: Interactive C Lecture
 * Slide System & C Execution Manager
 */

const lectureGroups = [
    { id: "welcome", title: "Welcome Room", icon: "home" },
    { id: "early-history", title: "Early Computing", icon: "history" },
    { id: "modern-foundations", title: "Modern Foundations", icon: "cpu" },
    { id: "pioneers", title: "Icons of Code", icon: "users" },
    { id: "why-c", title: "Why C?", icon: "help-circle" },
    { id: "c-foundations", title: "C Foundations", icon: "layers" },
    { id: "c-basics", title: "C Programming", icon: "code" }
];

/// --- LECTURE CONTENT DATA ---
const lectureData = [
    {
        id: "intro",
        title: "Introduction to C Programming - Lecture 1",
        groupId: "welcome",
        content: `
            <h2>The Language of the Universe</h2>
            <p>Welcome, freshers! Today we begin a journey into <strong>C</strong>—a language that is often called the "Mother of all modern languages."</p>
            <p>Before we write a single line of code, we need to understand <em>why</em> we are here and <em>how</em> we got here. Programming isn't just about math; it's about solving the history of human calculation.</p>
            <div class="academic-note">
                <strong>Goal for today:</strong> Understand the history of computing, the philosophy of C, and write your first interactive programs.
            </div>
        `
    },
    // --- EARLY COMPUTING ---
    {
        id: "history-abacus",
        title: "The Dawn of Calculation",
        type: "history-detail",
        groupId: "early-history",
        image: "images/abacus.png",
        content: `
            <h2>The Abacus (2,500 BC)</h2>
            <p>Computing didn't start with electricity. It started with beads and wires.</p>
            <p><strong>The First Computer:</strong> The Abacus allowed humans to perform complex arithmetic faster than memory alone. It taught us that "data" can be represented physically.</p>
        `,
        factoid: "An experienced abacus user can often beat a modern calculator in simple addition and subtraction!"
    },
    {
        id: "history-pascaline",
        title: "The Clockwork Calculator",
        type: "history-detail",
        groupId: "early-history",
        image: "images/pascaline.png",
        content: `
            <h2>The Pascaline (1642)</h2>
            <p>Blaise Pascal created the first mechanical calculator to help his father with tax accounting.</p>
            <p><strong>Mechanical Logic:</strong> Using a series of interlocking gears, it could add and subtract. This was the first time "logic" was automated by a machine.</p>
        `,
        factoid: "The Pascaline used a 'carry' mechanism identical in concept to how modern digital circuits handle overflow!"
    },
    {
        id: "history-loom",
        title: "The Weaver’s Code",
        type: "history-detail",
        groupId: "early-history",
        image: "images/jacquard_loom.png",
        content: `
            <h2>The Jacquard Loom (1804)</h2>
            <p>Joseph Marie Jacquard revolutionized weaving by using <strong>Punched Cards</strong> to control patterns.</p>
            <p><strong>Binary Ancestry:</strong> The holes in the cards represented "on" or "off" instructions. This is the direct ancestor of binary code and computer memory!</p>
        `,
        factoid: "The punched cards used in 1960s NASA computers are directly evolved from these 1800s silk looms."
    },
    {
        id: "history-babbage",
        title: "The Victorian Vision",
        type: "history-detail",
        groupId: "early-history",
        image: "images/analytical_engine.png",
        content: `
            <h2>The Analytical Engine (1837)</h2>
            <p>Charles Babbage designed a machine that had a "Mill" (CPU) and a "Store" (RAM).</p>
            <p><strong>The First Blueprint:</strong> Although it was never fully built in his lifetime, Babbage's design is functionally identical to the computers we use today.</p>
        `,
        factoid: "Babbage's machine was intended to be powered by a massive steam engine!"
    },
    {
        id: "history-ada",
        title: "The Logic of Software",
        type: "history-detail",
        groupId: "early-history",
        image: "images/ada_lovelace.png",
        content: `
            <h2>Ada Lovelace (1843)</h2>
            <p>Ada Lovelace was the first to realize that Babbage's machine could do more than just math—it could process <em>any</em> logic.</p>
            <p><strong>The First Algorithm:</strong> She wrote the first complex program (to calculate Bernoulli numbers), earning her the title of "The First Programmer."</p>
        `,
        factoid: "Ada saw the potential for computers to create music and art, over 100 years before it became possible!"
    },
    {
        id: "history-hollerith",
        title: "The Data Giant",
        type: "history-detail",
        groupId: "early-history",
        image: "images/hollerith_machine.png",
        content: `
            <h2>Hollerith’s Tabulator (1890)</h2>
            <p>Herman Hollerith used punched cards to process the 1890 US Census in Record time.</p>
            <p><strong>Birth of a Titan:</strong> Hollerith's company eventually merged with others to become <strong>IBM</strong>. This marked the shift from "calculators" to "data processing."</p>
        `,
        factoid: "The census took 8 years to count by hand in 1880; Hollerith's machine did it in just 6 months!"
    },
    // --- MODERN FOUNDATIONS ---
    {
        id: "history-von-neumann",
        title: "The Computer's Blueprint",
        type: "history-detail",
        groupId: "modern-foundations",
        image: "images/von_neumann.png",
        content: `
            <h2>von Neumann Architecture (1945)</h2>
            <p>John von Neumann formalized the concept of "Stored Program" computers, where both instructions and data live in the same memory.</p>
            <div class="von-neumann-grid">
                <p><strong>1. Input:</strong> How data enters (Keyboard/Mouse).</p>
                <p><strong>2. Output:</strong> How results exit (Monitor/Speaker).</p>
                <p><strong>3. Memory:</strong> Where data/programs are stored (RAM).</p>
                <p><strong>4. Control Unit:</strong> The "Brain's Manager" that decodes instructions and tells hardware what to do.</p>
                <p><strong>5. ALU:</strong> The "Arithmetic Logic Unit" — the actual calculator for math and logic.</p>
            </div>
        `,
        factoid: "Before this, 'reprogramming' a computer meant physically unplugging and moving thousands of wires!"
    },
    {
        id: "history-unix-c",
        title: "The Birth of the Legend",
        type: "history-detail",
        groupId: "modern-foundations",
        image: "images/dennis_ritchie.png",
        content: `
            <h2>The Birth of C (1972)</h2>
            <p>Dennis Ritchie and Ken Thompson created C at Bell Labs to rewrite the Unix operating system.</p>
            <p><strong>Portability:</strong> Before C, software was tied to one specific machine. C allowed code to be "portable"—meaning it could run on different types of hardware.</p>
        `,
        factoid: "C was actually the successor to a language simply called 'B'!"
    },
    {
        id: "history-ai",
        title: "The New Frontier",
        type: "history-detail",
        groupId: "modern-foundations",
        image: "images/ai_neural.png",
        content: `
            <h2>The AI / LLM Age (2023+)</h2>
            <p>We are now in the age of Large Language Models (LLMs) and Generative AI.</p>
            <p><strong>C’s Role Today:</strong> While you use AI to write code, the AI itself (PyTorch, TensorFlow) is powered by ultra-fast C and C++ code in the background.</p>
        `,
        factoid: "GPT-4's massive calculations are ultimately executed on GPUs running optimized C/C++ kernels!"
    },
    // --- ICONS OF CODE ---
    {
        id: "icon-ada-lovelace",
        title: "The First Programmer",
        type: "history-detail",
        groupId: "pioneers",
        image: "images/ada_lovelace_icon.png",
        content: `
            <h2>Ada Lovelace (1815 - 1852)</h2>
            <p>Ada Lovelace was the first person to realize that Babbage's Analytical Engine had applications beyond pure calculation.</p>
            <p><strong>The First Algorithm:</strong> She wrote the first algorithm intended to be carried out by a machine, including the complex Bernoulli numbers calculation!</p>
        `,
        factoid: "Ada saw the machine could process 'music and art'—essentially predicting modern multimedia over 100 years early!"
    },
    {
        id: "icon-grace-hopper",
        title: "The Queen of Code",
        type: "history-detail",
        groupId: "pioneers",
        image: "images/grace_hopper.png",
        content: `
            <h2>Grace Hopper (1906 - 1992)</h2>
            <p>Admiral Grace Hopper was a pioneer of computer programming. She believed that programs should be written in a language that is close to English rather than machine code.</p>
            <p><strong>The First Compiler:</strong> She created the first ever compiler (A-0), which paved the way for modern languages like COBOL and eventually C!</p>
        `,
        factoid: "Grace coined the term 'debugging' after finding a real moth stuck in the Harvard Mark II computer's relay!"
    },
    {
        id: "icon-alan-turing",
        title: "The Architect of AI",
        type: "history-detail",
        groupId: "pioneers",
        image: "images/alan_turing.png",
        content: `
            <h2>Alan Turing (1912 - 1954)</h2>
            <p>Alan Turing provided the formalization of the concepts of 'algorithm' and 'computation' with the Turing machine, which can be considered a model of a general-purpose computer.</p>
            <p><strong>Breaking the Code:</strong> During WWII, he led the team that cracked the Enigma code, a feat that is estimated to have shortened the war by at least two years.</p>
        `,
        factoid: "The 'Turing Test' is still used today as the baseline for determining if an AI can truly mimic human conversation!"
    },
    {
        id: "icon-dennis-ritchie",
        title: "The Father of C",
        type: "history-detail",
        groupId: "pioneers",
        image: "images/dennis_ritchie_portrait.png",
        content: `
            <h2>Dennis Ritchie (1941 - 2011)</h2>
            <p>Dennis Ritchie created the C programming language and, with long-time colleague Ken Thompson, the Unix operating system.</p>
            <p><strong>The C Legacy:</strong> His work laid the foundations for the modern digital era. Without C, we wouldn't have Windows, macOS, Linux, or the Internet as we know it.</p>
        `,
        factoid: "Dennis often joked that C is 'quirky, flawed, and an enormous success'—a perfect description of the language's enduring power!"
    },
    // --- WHY C? ---
    {
        id: "why-c-memory",
        title: "Direct Memory Access",
        type: "history-detail",
        groupId: "why-c",
        image: "images/memory_access.png",
        content: `
            <h2>Lifting the Hood</h2>
            <p>Modern languages like Python provide a "comfortable illusion" where memory is managed for you. C removes that illusion.</p>
            <p><strong>The Power of Pointers:</strong> Learning C forces you to understand <em>Memory Addresses</em>. This knowledge is what separates a user of a language from a true architect of software.</p>
        `,
        factoid: "Almost all 'Memory Leaks' and 'Buffer Overflows'—the most common security bugs—happen because of a misunderstanding of how C handles memory!"
    },
    {
        id: "why-c-performance",
        title: "The Engine of AI & OS",
        type: "history-detail",
        groupId: "why-c",
        image: "images/performance_engine.png",
        content: `
            <h2>Raw Speed & Performance</h2>
            <p>If you want to build a web app, use JavaScript. If you want to build the <em>browser</em> that runs the web app, you use C and C++.</p>
            <p><strong>The AI Engine:</strong> While data scientists use Python to talk to AI models, the actual mathematical "kernels" (the heavy lifting) are written in C for maximum performance.</p>
        `,
        factoid: "Linux, Windows, macOS, and even the Android kernel are all over 90% C code - it's the foundation of almost everything with a screen!"
    },
    {
        id: "why-c-roots",
        title: "The Universal Ancestor",
        type: "history-detail",
        groupId: "why-c",
        image: "images/language_tree.png",
        content: `
            <h2>The Root of All Logic</h2>
            <p>C is often called a "Middle-Level" language. It is human-readable enough to be productive, but low-level enough to control hardware.</p>
            <p><strong>Syntactic Legacy:</strong> Once you learn C, you have already learned 70% of the syntax for C++, Java, JavaScript, and even parts of Python and PHP.</p>
        `,
        factoid: "The C programming language has been around since 1972 and is still consistently in the top 3 most used languages in the world!"
    },
    {
        id: "why-c-mechanics",
        title: "Drivers vs. Mechanics",
        type: "history-detail",
        groupId: "why-c",
        image: "images/drivers_vs_mechanics.png",
        content: `
            <h2>The Mechanic of Code</h2>
            <p>If we compare modern AI tools and LLMs to powerful cars—they can get you anywhere fast. But regular users are just "Drivers."</p>
            <p><strong>The Engineering Gap:</strong> Learning C makes you a <strong>Mechanic</strong>. While a driver can use a car, a mechanic understands how to fix it, optimize it, and even build an entirely new one from scratch.</p>
        `,
        factoid: "The world will always need drivers, but it is the mechanics who build the future and keep the modern digital engine running!"
    },
    // --- C FOUNDATIONS ---
    {
        id: "fond-compiler",
        title: "The Compiler: Translator",
        type: "history-detail",
        groupId: "c-foundations",
        image: "images/performance_engine.png",
        content: `
            <h2>Source Code to Machine Code</h2>
            <p>Computers are fast, but they are also quite simple. They only understand 0s and 1s (Machine Code).</p>
            <p><strong>The Bridge:</strong> A <strong>Compiler</strong> is a special program that translates your C code into a format the machine can execute. Before you can run a program, it <em>must</em> be compiled!</p>
        `,
        factoid: "The C compiler checks for syntax errors—if you forget a semicolon, it's the compiler that stops you!"
    },
    {
        id: "fond-var",
        title: "Variables: Boxes of Memory",
        type: "history-detail",
        groupId: "c-foundations",
        image: "images/memory_access.png",
        content: `
            <h2>Variables & Types</h2>
            <p>In C, a <strong>variable</strong> is like a labeled container in memory. Before you use one, you must tell the computer what <em>type</em> of data it will hold.</p>
            <p><strong>Common Types in this Lesson:</strong></p>
            <ul>
                <li><code>int</code>: For whole numbers (like 1, 42, -5).</li>
                <li><code>float</code>: For decimal numbers (like 3.14, 0.007).</li>
            </ul>
        `,
        factoid: "Each variable has a unique memory address—imagine it as the GPS coordinates for your data!"
    },
    {
        id: "fond-var-ex",
        title: "Variable Example: X-Ray",
        type: "code-detail",
        groupId: "c-foundations",
        code: `int hops = 10;\nfloat height = 1.5;`,
        details: [
            { line: "1", title: "Integers", content: "We declare <code>int hops</code> to store a whole number (10). This creates a 'hops' box on the memory shelf." },
            { line: "2", title: "Decimals", content: "We declare <code>float height</code> to store a decimal number (1.5). This uses a slightly bigger box in memory." }
        ]
    },
    {
        id: "fond-char",
        title: "The 'Char' Type",
        type: "history-detail",
        groupId: "c-foundations",
        image: "images/language_tree.png",
        content: `
            <h2>Single Characters</h2>
            <p>But what if we want to store a single letter? We use the <code>char</code> type.</p>
            <p><strong>The Secret of ASCII:</strong> Computers actually store letters as numbers! For example, the letter 'A' is stored as the number 65. The <code>char</code> type handles this translation for you.</p>
        `,
        factoid: "A char occupies only 1 byte of memory—it's the smallest standard data type in C!"
    },
    {
        id: "fond-arith",
        title: "Operators: The Math Engine",
        type: "history-detail",
        groupId: "c-foundations",
        image: "images/performance_engine.png",
        content: `
            <h2>Arithmetic Operators</h2>
            <p>C uses standard symbols for math, but with a few additions you might not know from your calculator.</p>
            <p><strong>Basic Operations:</strong></p>
            <ul>
                <li><code>+</code> and <code>-</code>: Addition and Subtraction.</li>
                <li><code>*</code> and <code>/</code>: Multiplication and Division.</li>
                <li><code>%</code>: The <strong>Modulo</strong> operator. It gives you the <em>remainder</em> of a division (e.g., 5 % 2 = 1).</li>
                <li><code>++</code>: The <strong>Increment</strong> operator. It adds 1 to a variable instantly!</li>
            </ul>
        `,
        factoid: "The % (modulo) operator is the secret tool for checking if numbers are even, odd, or prime!"
    },
    {
        id: "fond-arith-ex",
        title: "Arithmetic Example: X-Ray",
        type: "code-detail",
        groupId: "c-foundations",
        code: `int rem = 17 % 5;\nhops++;`,
        details: [
            { line: "1", title: "The Remainder", content: "<code>17 % 5</code> calculates how many are left over after 17 is divided by 5. The result is 2, which is stored in <code>rem</code>." },
            { line: "2", title: "Instant Plus One", content: "<code>hops++</code> is a super-fast way to write <code>hops = hops + 1</code>. It's used thousands of times in C!" }
        ]
    },
    {
        id: "fond-format",
        title: "Format Specifiers (%)",
        type: "history-detail",
        groupId: "c-foundations",
        image: "images/memory_access.png",
        content: `
            <h2>The Translation Code</h2>
            <p>When using <code>printf</code> or <code>scanf</code>, we use special symbols to tell C how to read a variable.</p>
            <ul>
                <li><code>%d</code>: For integers (think 'D' for Decimal).</li>
                <li><code>%f</code>: For floats (think 'F' for Float).</li>
                <li><code>%c</code>: For chars (think 'C' for Character).</li>
            </ul>
        `,
        factoid: "The '%' sign acts like a placeholder—it tells the program exactly where to 'plug in' the value!"
    },
    {
        id: "fond-escape",
        title: "Escape Sequences (\\)",
        type: "history-detail",
        groupId: "c-foundations",
        image: "images/drivers_vs_mechanics.png",
        content: `
            <h2>Special Commands</h2>
            <p>Sometimes we need to print things that aren't letters, like a "New Line". We use the backslash <code>\\</code> as a special "escape" character.</p>
            <ul>
                <li><code>\\n</code>: Start a new line.</li>
                <li><code>\\t</code>: Add a Tab (indent).</li>
                <li><code>\\\\</code>: To print a literal backslash.</li>
            </ul>
        `,
        factoid: "The backslash tells the computer: 'Don't print the next letter; treat it as a command instead!'"
    },
    {
        id: "fond-logic",
        title: "Logic: Comparison Tools",
        type: "history-detail",
        groupId: "c-foundations",
        image: "images/language_tree.png",
        content: `
            <h2>Relational Operators</h2>
            <p>Logic is built by comparing two values and asking: "Is this true?"</p>
            <p><strong>Making Comparisons:</strong></p>
            <ul>
                <li><code>></code> and <code><</code>: Greater or Less than.</li>
                <li><code>>=</code> and <code><=</code>: At least or At most.</li>
                <li><code>==</code>: Equal to? (Wait, why two equal signs? Keep reading!)</li>
                <li><code>!=</code>: Not equal to?</li>
            </ul>
        `,
        factoid: "A comparison always results in 1 (True) or 0 (False) deep inside the computer's circuitry."
    },
    {
        id: "fond-logic-ex",
        title: "Comparison Example: X-Ray",
        type: "code-detail",
        groupId: "c-foundations",
        code: `if (age >= 18) {\n    // TRUE: Program runs this part\n}`,
        details: [
            { line: "1 (Inside)", title: "The Question", content: "The computer checks: 'Is the age variable at least 18?' If yes, the result is 1 (True)." },
            { line: "1-3", title: "The Door", content: "The <code>if</code> statement acts like a gatekeeper. Only if the comparison is 1 (True) can the computer enter and run the code inside." }
        ]
    },
    {
        id: "fond-rule",
        title: "The Golden Rule (= vs ==)",
        type: "history-detail",
        groupId: "c-foundations",
        image: "images/drivers_vs_mechanics.png",
        content: `
            <h2>The Most Common Mistake</h2>
            <p>This is the rule that separates students from seasoned mechanics. In C, the '=' symbol has two very different meanings depending on how many you use.</p>
            <p><strong>Assignment (<code>=</code>):</strong> Used to <em>store</em> a value. <code>x = 5;</code> means "Put the number 5 into the box x."</p>
            <p><strong>Equality (<code>==</code>):</strong> Used to <em>ask</em> a question. <code>if (x == 5)</code> means "Is the value inside box x equal to 5?"</p>
        `,
        factoid: "Forgetting the second '=' is the #1 reason why beginners find their code doing the opposite of what they wanted!"
    },
    {
        id: "fond-rule-ex",
        title: "The Equality Rule: X-Ray",
        type: "code-detail",
        groupId: "c-foundations",
        code: `x = 100;\nif (x == 100) {\n    // Success!\n}`,
        details: [
            { line: "1", title: "Assignment", content: "One equal sign <code>=</code> is an instruction: 'Make x equal to 100.' This fills the box with a value." },
            { line: "2", title: "Equality Check", content: "Two equal signs <code>==</code> is a question: 'Does x actually contain 100?' It returns True or False without changing the values." }
        ]
    },
    {
        id: "fond-scanf",
        title: "Talking Back (scanf)",
        type: "history-detail",
        groupId: "c-foundations",
        image: "images/memory_access.png",
        content: `
            <h2>Accepting User Input</h2>
            <p>So far, our programs only talk <em>at</em> you. To make them truly interactive, we use the <code>scanf</code> function to read input from the keyboard.</p>
            <p><strong>The Ampersand (&):</strong> When using <code>scanf</code>, we must put an <code>&</code> before the variable name. This tells C exactly <em>where</em> in memory to store the user's answer.</p>
        `,
        factoid: "Think of & as the 'address' of the variable box—like a house number for the computer to deliver the data!"
    },
    {
        id: "fond-scanf-ex",
        title: "Input Example: X-Ray",
        type: "code-detail",
        groupId: "c-foundations",
        code: `int age;\nscanf("%d", &age);`,
        details: [
            { line: "1", title: "Prepare the Box", content: "We must declare the variable <code>int age</code> first so the computer knows what type of data to expect." },
            { line: "2", title: "The Delivery", content: "<code>scanf</code> pauses the program and waits for you to type a number. The <code>&</code> ensures that number is delivered straight to the 'age' box." }
        ]
    },
    {
        id: "fond-comments",
        title: "Writing for Humans",
        type: "history-detail",
        groupId: "c-foundations",
        image: "images/performance_engine.png",
        content: `
            <h2>Comments & Documentation</h2>
            <p>The best code isn't just for computers; it's for humans too. <strong>Comments</strong> are parts of the code that the computer ignores entirely.</p>
            <ul>
                <li><code>//</code>: Single line comment.</li>
                <li><code>/* ... */</code>: Multi-line comment block.</li>
            </ul>
        `,
        factoid: "Writing good comments is like leaving a map for your future self—you'll thank yourself 6 months from now!"
    },
    // --- C BASICS ---
    {
        id: "code-hello",
        title: "Our First Slide",
        isCode: true,
        groupId: "c-basics",
        code: `#include <stdio.h>\n\nint main() {\n    printf("Hello, Programmer!\\n");\n    printf("Welcome to the Bunny Toy Box.\\n");\n    return 0;\n}`,
        content: `
            <h2>Hello, World!</h2>
            <p>Every journey begins with a single line. In C, we use <code>printf</code> to display text on the screen. Try running the code below!</p>
        `
    },
    {
        id: "code-hello-detail",
        title: "Hello World: X-Ray",
        type: "code-detail",
        groupId: "c-basics",
        code: `#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}`,
        details: [
            { line: "1", title: "The Header", content: "<code>#include &lt;stdio.h&gt;</code> tells the computer to load the 'Standard Input Output' library so we can use <code>printf</code>." },
            { line: "3", title: "The Entry Point", content: "<code>int main()</code> is the starting point of every C program. The computer looks for this specific name to begin execution." },
            { line: "4", title: "Output & Escape", content: "<code>printf</code> sends text to the screen. <code>\\n</code> is an <strong>Escape Sequence</strong> that creates a new line." },
            { line: "5", title: "The Exit", content: "<code>return 0;</code> tells the Operating System that the program finished successfully." }
        ]
    },
    {
        id: "code-hello-extend",
        title: "Hello World: Variations",
        isCode: true,
        groupId: "c-basics",
        code: `#include <stdio.h>\n\nint main() {\n    printf("Bunny is hopping...\\n");\n    printf("     (\\\\ _ /) \\n");\n    printf("     ( o.o ) \\n");\n    printf("     ( > < ) \\n");\n    return 0;\n}`,
        content: `
            <h2>More Fun with Text</h2>
            <p>You can use multiple <code>printf</code> calls to create ASCII art or logs. Remember that without <code>\\n</code>, all text would stay on the same line!</p>
        `
    },
    {
        id: "code-math",
        title: "Basic Mathematics",
        isCode: true,
        groupId: "c-basics",
        code: `#include <stdio.h>\n\nint main() {\n    int a = 15;\n    int b = 4;\n    \n    int sum = a + b;\n    int prod = a * b;\n    float div = (float)a / b;\n\n    printf("Sum: %d\\n", sum);\n    printf("Product: %d\\n", prod);\n    printf("Division: %.2f\\n", div);\n\n    return 0;\n}`,
        content: `
            <h2>Variables & Arithmetic</h2>
            <p>Computers are essentially powerful calculators. In C, we declare variables with types (like <code>int</code> for integers or <code>float</code> for decimals) and use placeholders like <code>%d</code> to print them.</p>
        `
    },
    {
        id: "code-math-detail",
        title: "Math: X-Ray",
        type: "code-detail",
        groupId: "c-basics",
        code: `int a = 15;\nint b = 4;\nint sum = a + b;\nfloat div = (float)a / b;\nprintf("Sum: %d", sum);`,
        details: [
            { line: "1-2", title: "Variable Declaration", content: "We use <code>int</code> for whole numbers. <code>a</code> and <code>b</code> are names of boxes in memory." },
            { line: "3", title: "The Assignment", content: "The <code>+</code> sign adds values together. The single <code>=</code> stores the result in the <code>sum</code> box." },
            { line: "4", title: "Type Casting", content: "Because <code>a</code> and <code>b</code> are integers, we use <code>(float)</code> to temporarily treat them as decimals for a precise division." },
            { line: "5", title: "Format Specifiers", content: "Inside <code>printf</code>, <code>%d</code> and <code>%f</code> are <strong>Format Specifiers</strong>. They tell C how to translate binary boxes into text." }
        ]
    },
    {
        id: "code-math-extend",
        title: "Math: More Operators",
        isCode: true,
        groupId: "c-basics",
        code: `#include <stdio.h>\n\nint main() {\n    int x = 10;\n    int y = 3;\n    \n    int mod = x % y;  // Modulo (Remainder)\n    int calc = (x + y) * 2;\n\n    printf("Remainder of 10/3: %d\\n", mod);\n    printf("Result of (10+3)*2: %d\\n", calc);\n\n    return 0;\n}`,
        content: `
            <h2>Modulo & Parentheses</h2>
            <p>C follows standard math rules (PEMDAS). The <code>%</code> (modulo) operator gives you the remainder of a division—very useful in programming!</p>
        `
    },
    {
        id: "code-logic",
        title: "Conditional Logic",
        isCode: true,
        groupId: "c-basics",
        code: `#include <stdio.h>\n\nint main() {\n    int age = 19;\n\n    printf("You are %d years old.\\n", age);\n\n    if (age >= 18) {\n        printf("You are considered an adult!\\n");\n    } else {\n        printf("You are still a minor.\\n");\n    }\n\n    return 0;\n}`,
        content: `
            <h2>Decision Making</h2>
            <p>Logic is what makes programs "smart." The <code>if-else</code> statement allows your code to take different paths based on conditions.</p>
        `
    },
    {
        id: "code-logic-detail",
        title: "Logic: X-Ray",
        type: "code-detail",
        groupId: "c-basics",
        code: `if (age >= 18) {\n    // Path A\n} else {\n    // Path B\n}`,
        details: [
            { line: "1", title: "The Condition", content: "The <code>if</code> statement checks if the expression inside <code>( )</code> is true. <code>>=</code> means 'greater than or equal to'." },
            { line: "1-3", title: "The Block", content: "Curly braces <code>{ }</code> group multiple lines of code together. If the condition is true, only this block runs." },
            { line: "3", title: "The Alternative", content: "The <code>else</code> keyword provides a fallback option if the first condition was false." }
        ]
    },
    {
        id: "code-logic-extend",
        title: "Logic: Multi-Path",
        isCode: true,
        groupId: "c-basics",
        code: `#include <stdio.h>\n\nint main() {\n    int score = 85;\n\n    if (score >= 90) {\n        printf("Grade: A\\n");\n    } else if (score >= 80) {\n        printf("Grade: B\\n");\n    } else {\n        printf("Grade: C\\n");\n    }\n\n    return 0;\n}`,
        content: `
            <h2>The Ladder of Logic</h2>
            <p>You can use <code>else if</code> to check for multiple different conditions in a sequence. Only the first true path will be taken!</p>
        `
    },
    {
        id: "code-loops",
        title: "Repetition (Loops)",
        isCode: true,
        groupId: "c-basics",
        code: `#include <stdio.h>\n\nint main() {\n    printf("Counting some bunnies...\\n");\n\n    for (int i = 1; i <= 5; i++) {\n        printf("Bunny #%d hops!\\n", i);\n    }\n\n    printf("All done!\\n");\n    return 0;\n}`,
        content: `
            <h2>The 'for' Loop</h2>
            <p>Loops allow us to repeat an action. A <code>for</code> loop is composed of an initialization, a condition, and an increment.</p>
        `
    },
    {
        id: "code-loops-detail",
        title: "Loops: X-Ray",
        type: "code-detail",
        groupId: "c-basics",
        code: `for (int i = 1; i <= 5; i++) {\n    // Repetitive Task\n}`,
        details: [
            { line: "1 (Part A)", title: "Initialization", content: "<code>int i = 1</code> creates a starting point at 1." },
            { line: "1 (Part B)", title: "Comparison", content: "The loop continues as long as the <strong>Comparison</strong> <code>i &lt;= 5</code> remains true." },
            { line: "1 (Part C)", title: "Increment", content: "<code>i++</code> is the <strong>Increment Operator</strong>. It adds 1 to the counter after every hop." },
            { line: "2", title: "The Loop Body", content: "The code inside the braces is what actually repeats!" }
        ]
    },
    {
        id: "code-loops-extend",
        title: "Loops: Power",
        isCode: true,
        groupId: "c-basics",
        code: `#include <stdio.h>\n\nint main() {\n    int power = 1;\n    printf("Powers of 2:\\n");\n\n    for (int i = 1; i <= 8; i++) {\n        power = power * 2;\n        printf("2^%d = %d\\n", i, power);\n    }\n\n    return 0;\n}`,
        content: `
            <h2>Calculations in Loops</h2>
            <p>Loops are incredibly powerful for repetitive math. Here we calculate powers of 2 by multiplying the previous result 8 times!</p>
        `
    },
    {
        id: "code-scanf",
        title: "User Interaction (scanf)",
        isCode: true,
        groupId: "c-basics",
        code: `#include <stdio.h>\n\nint main() {\n    int age;\n\n    printf("How old are you? ");\n    scanf("%d", &age);\n\n    printf("Wow, %d years old! That's a great age.\\n", age);\n\n    return 0;\n}`,
        content: `
            <h2>Accepting User Input</h2>
            <p>To make programs interactive, we use <code>scanf</code>. This function pauses the program and waits for the user to provide data from the keyboard.</p>
        `
    },
    {
        id: "code-scanf-detail",
        title: "scanf: X-Ray",
        type: "code-detail",
        groupId: "c-basics",
        code: `int age;\nscanf("%d", &age);`,
        details: [
            { line: "1", title: "Declaration", content: "We must declare the variable first so the computer has a 'box' ready to store the input." },
            { line: "2 (Part A)", title: "The placeholder", content: "<code>%d</code> tells C to expect an integer from the user." },
            { line: "2 (Part B)", title: "The Address (&)", content: "The ampersand <code>&</code> is like a house address. it tells <code>scanf</code> exactly which memory box to 'deliver' the value to!" }
        ]
    },
    {
        id: "code-scanf-extend",
        title: "scanf: Multiple Inputs",
        isCode: true,
        groupId: "c-basics",
        code: `#include <stdio.h>\n\nint main() {\n    int d, m, y;\n\n    printf("Enter birthday (DD MM YYYY): ");\n    scanf("%d %d %d", &d, &m, &y);\n\n    printf("You were born on the %d day of month %d in %d!\\n", d, m, y);\n\n    return 0;\n}`,
        content: `
            <h2>Reading Multiple Values</h2>
            <p>You can read multiple pieces of data in a single <code>scanf</code> call by separating the format specifiers with spaces.</p>
        `
    }
];

// --- APP STATE ---
let currentSlideIndex = 0;
let editor = null;
let collapsedGroups = new Set(); // Tracks collapsed group IDs

/**
 * Initialize the lecture
 */
function initLecture() {
    renderSidebar();
    showSlide(0);
    lucide.createIcons();
    
    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (e.target.closest('.CodeMirror')) return; // Don't navigate while typing code
        
        if (e.key === 'ArrowRight' || e.key === 'n') nextSlide();
        if (e.key === 'ArrowLeft' || e.key === 'p') prevSlide();
    });
}

/**
 * Render the sidebar navigation items as grouped collapsible sections
 */
function renderSidebar() {
    const nav = document.getElementById('sidebar-nav');
    
    nav.innerHTML = lectureGroups.map(group => {
        const groupSlides = lectureData.reduce((acc, slide, index) => {
            if (slide.groupId === group.id) acc.push({ ...slide, index });
            return acc;
        }, []);

        const isCollapsed = collapsedGroups.has(group.id);
        const hasActiveSlide = groupSlides.some(s => s.index === currentSlideIndex);
        
        // Auto-expand if active slide is in this group
        if (hasActiveSlide && isCollapsed) {
            collapsedGroups.delete(group.id);
        }

        return `
            <div class="sidebar-group ${isCollapsed ? 'collapsed' : ''}" data-group="${group.id}">
                <div class="group-header" onclick="toggleGroup('${group.id}')">
                    <div class="group-title">
                        <i data-lucide="${group.icon}" class="w-4 h-4"></i>
                        <span>${group.title}</span>
                    </div>
                    <i data-lucide="chevron-down" class="chevron"></i>
                </div>
                <div class="group-content">
                    ${groupSlides.map(slide => `
                        <div class="nav-item ${slide.index === currentSlideIndex ? 'active' : ''}" onclick="showSlide(${slide.index})">
                            <span class="nav-num">${(slide.index + 1).toString().padStart(2, '0')}</span>
                            <span>${slide.title}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
    
    lucide.createIcons();
}

/**
 * Toggle a group's collapse state
 */
function toggleGroup(groupId) {
    if (collapsedGroups.has(groupId)) {
        collapsedGroups.delete(groupId);
    } else {
        collapsedGroups.add(groupId);
    }
    renderSidebar();
}

/**
 * Show a specific slide
 */
function showSlide(index) {
    if (index < 0 || index >= lectureData.length) return;
    
    currentSlideIndex = index;
    const slideData = lectureData[index];
    const container = document.getElementById('slides-container');
    
    // Update global UI
    document.getElementById('current-slide-num').textContent = currentSlideIndex + 1;
    document.getElementById('total-slides-num').textContent = lectureData.length;
    document.getElementById('lecture-title').textContent = slideData.title;

    // Build the slide content
    let html = `<div class="slide active">`;

    if (slideData.type === 'history-detail') {
        html += `
            <div class="history-detail-layout">
                <div class="history-text">
                    ${slideData.content}
                    <div class="factoid-box">
                        <i data-lucide="lightbulb"></i>
                        <div class="factoid-content">
                            <h4>Did You Know?</h4>
                            <p>${slideData.factoid}</p>
                        </div>
                    </div>
                </div>
                <div class="history-image-container">
                    <img src="${slideData.image}" alt="${slideData.title}">
                </div>
            </div>
        `;
    } else if (slideData.type === 'code-detail') {
        const codeLines = slideData.code.split('\n');
        html += `
            <div class="code-detail-layout">
                <div class="code-display-box">
                    <pre>${codeLines.map(line => `<code>${line.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code>`).join('')}</pre>
                </div>
                <div class="explanation-column">
                    ${slideData.details.map((detail, index) => `
                        <div class="detail-item" style="animation-delay: ${index * 300}ms">
                            <span class="line-ref">Line ${detail.line}</span>
                            <h4>${detail.title}</h4>
                            <p>${detail.content}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        html += slideData.content;
    }

    // Add Code Playground if needed
    if (slideData.isCode) {
        html += `
            <div class="playground-container">
                <div class="playground-header">
                    <div class="flex items-center gap-2">
                        <i data-lucide="file-code" class="w-4 h-4"></i>
                        <span class="file-name">main.c</span>
                    </div>
                    <button class="btn btn-primary bg-emerald-500 hover:bg-emerald-600 shadow-none text-xs py-1.5" onclick="runCode()">
                        <i data-lucide="play" class="w-3 h-3"></i> Run Code
                    </button>
                </div>
                <div class="editor-area" id="editor-wrapper">
                    <textarea id="code-editor">${slideData.code}</textarea>
                </div>
                <div class="console-input-area" style="${slideData.code.includes('scanf') ? 'display: flex;' : 'display: none;'}">
                    <i data-lucide="terminal"></i>
                    <input type="text" id="stdin-input" value="0" placeholder="Type inputs here (e.g. 25 or 12 05 1990)..." autocomplete="off">
                </div>
                <div class="console-area" id="console-output">
                    <div class="console-status">System Console Ready...</div>
                    <span>Click 'Run Code' to see the output here.</span>
                </div>
            </div>
        `;
    }

    html += `</div>`;
    container.innerHTML = html;

    // Initialize CodeMirror if code slide
    if (slideData.isCode) {
        const textArea = document.getElementById('code-editor');
        editor = CodeMirror.fromTextArea(textArea, {
            mode: "text/x-csrc",
            theme: "dracula",
            lineNumbers: true,
            indentUnit: 4,
            matchBrackets: true,
            autoCloseBrackets: true,
            extraKeys: {"Ctrl-Space": "autocomplete"}
        });
        
        // Ensure standard UI scaling
        editor.setSize("100%", "300px");
    } else {
        editor = null;
    }

    // Refresh Icons and sidebar active state
    renderSidebar();
    lucide.createIcons();
    
    // Smooth scroll to top
    container.scrollTop = 0;
}

function nextSlide() {
    if (currentSlideIndex < lectureData.length - 1) {
        showSlide(currentSlideIndex + 1);
    }
}

function prevSlide() {
    if (currentSlideIndex > 0) {
        showSlide(currentSlideIndex - 1);
    }
}

/**
 * Execute C Code using JSCPP
 */
function runCode() {
    if (!editor) return;
    
    const code = editor.getValue();
    const outputArea = document.getElementById('console-output');
    const stdinField = document.getElementById('stdin-input');
    
    outputArea.innerHTML = `<div class="console-status">Compiling and Executing...</div>`;
    
    // Clear the output accumulator
    let outputBuffer = "";
    
    try {
        // Preparation for JSCPP Input Handling
        let input = stdinField ? stdinField.value : "";
        if (input && !input.endsWith("\n")) input += "\n";

        // Configuration for JSCPP
        const config = {
            memory_size: 1 * 1024 * 1024,
            stdio: {
                write: (s) => {
                    outputBuffer += s;
                    return s.length;
                }
            },
            includes: {
                stdio: true, 
                math: true
            }
        };

        const exitCode = JSCPP.run(code, input, config);
        
        // Format and display the output
        outputArea.innerHTML = `
            <div class="console-status text-emerald-400">Execution Successful (Exit Code: ${exitCode})</div>
            <div class="mt-2 text-white font-mono">${outputBuffer || "Program executed without output."}</div>
        `;
    } catch (err) {
        // Handle compilation or runtime errors
        outputArea.innerHTML = `
            <div class="console-status text-red-400">Execution Error</div>
            <div class="mt-2 text-red-200 font-mono">${err.toString()}</div>
        `;
        console.error(err);
    }
}

// Start the app when window loads
window.onload = initLecture;

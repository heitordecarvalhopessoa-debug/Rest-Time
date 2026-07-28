const TutorialManager = {
    STORAGE_KEY: 'rest_time_tutorial_disabled',
    currentStep: 0,
    modalElement: null,
    highlightElement: null,

    steps: [
        {
            title: "WELCOME TO REST TIME",
            text: "A relaxing space to create and interact with particles. Let's take a quick tour of the main tools!",
            target: null,
            position: "center",
            image: "src/imgs/t1.png"
        },
        {
            title: "TOP BAR (HOTBAR)",
            text: "In the top-left corner, you will find your session timer, user profile, name change options, and shortcuts.",
            target: ".hotbar",
            position: "right",
            image: null
        },
        {
            title: "MUSIC PLAYER",
            text: "Click this music button to open the Audio Visualizer and load your favorite songs to make particles react to the beat!",
            target: "#music-menu-toggle-btn",
            position: "right",
            image: "src/imgs/t2.png"
        },
        {
            title: "TOOL PALETTE",
            text: "Click the palette icon in the bottom-right corner to customize brushes, particle size, lifetime, and color gradients.",
            target: "#palette-toggle-btn",
            position: "left",
            image: "src/imgs/t3.png"
        },
        {
            title: "SPECIAL EFFECTS (GLOW & BLACK HOLE)",
            text: "Toggle Glow on the palette for glowing particles, or press B on your keyboard to create a Black Hole.",
            target: null,
            position: "left",
            image: "src/imgs/t4.png"
        },
        {
            title: "ERASER & PAUSE",
            text: "Use the Eraser tool to clean up specific areas, or press CTRL to pause the entire simulation at any moment.",
            target: "#eraser-btn",
            position: "left",
            image: null
        },
        {
            title: "ZEN MODE & SCREENSHOT",
            text: "Press H to hide the UI for a clean view, or press S to capture high-quality screenshots of your art.",
            target: "#screenshot-btn",
            position: "right",
            image: null
        },
        {
            title: "KEYBOARD SHORTCUTS",
            text: "Press W anytime to open the Shortcuts Menu. Press R anytime to reopen this tutorial!",
            target: null,
            position: "center",
            image: "src/imgs/t5.png"
        }
    ],

    init() {
        this.setupKeyboardShortcut();

        if (localStorage.getItem(this.STORAGE_KEY) === 'true') {
            return;
        }

        this.startTutorial();
    },

    setupKeyboardShortcut() {
        window.addEventListener('keydown', (e) => {
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                return;
            }

            if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                this.startTutorial();
            }
        });

        window.addEventListener('resize', () => {
            if (this.modalElement && this.modalElement.style.display !== 'none') {
                this.positionCardAndHighlight(this.steps[this.currentStep]);
            }
        });
    },

    startTutorial() {
        this.createTutorialModal();
        this.showStep(0);
    },

    createTutorialModal() {
        if (document.getElementById('tutorial-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'tutorial-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 10000;
            transition: all 0.3s ease;
        `;

        modal.innerHTML = `
            <div id="tutorial-card" class="card" style="
                position: absolute;
                width: min(320px, 90vw);
                max-height: 90vh;
                overflow-y: auto;
                padding: 16px;
                background: rgba(15, 23, 42, 0.95);
                border: 1px solid #3b82f6;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 15px rgba(59, 130, 246, 0.2);
                backdrop-filter: blur(10px);
                pointer-events: auto;
                transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                z-index: 10001;
                box-sizing: border-box;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
                    <h2 id="tutorial-title" style="color: #60a5fa; font-size: 13px; margin: 0; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;"></h2>
                    <span id="tutorial-step-count" style="font-size: 10px; color: #64748b; font-family: monospace; background: #0f172a; padding: 2px 6px; 4px; border: 1px solid #1e293b;">1/8</span>
                </div>

                <div id="tutorial-image-container" style="display: none; width: 100%; margin-bottom: 12px; overflow: hidden; border: 1px solid #1e293b;">
                    <img id="tutorial-image" src="" alt="Tutorial preview" style="width: 100%; height: auto; display: block; object-fit: cover;">
                </div>
                
                <p id="tutorial-text" style="font-size: 11px; color: #94a3b8; margin-bottom: 16px; line-height: 1.6; text-align: left; font-family: monospace;"></p>

                <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <button id="tutorial-never-btn" style="background: transparent; border: none; color: #64748b; font-size: 10px; cursor: pointer; text-decoration: underline; padding: 0; font-family: monospace;">Don't show again</button>

                    <div style="display: flex; gap: 6px;">
                        <button id="tutorial-prev-btn" class="cancel-btn" style="padding: 5px 10px; font-size: 10px; cursor: pointer; font-family: monospace;">Prev</button>
                        <button id="tutorial-next-btn" style="padding: 5px 12px; font-size: 10px; width: auto; background: #3b82f6; color: #ffffff; border: none; cursor: pointer; font-weight: bold; font-family: monospace;">Next</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modalElement = modal;

        const highlight = document.createElement('div');
        highlight.id = 'tutorial-highlight';
        highlight.style.cssText = `
            position: fixed;
            pointer-events: none;
            border: 2px solid #3b82f6;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.7);
            transition: all 0.3s ease;
            z-index: 9999;
            display: none;
        `;
        document.body.appendChild(highlight);
        this.highlightElement = highlight;

        document.getElementById('tutorial-next-btn').addEventListener('click', () => this.next());
        document.getElementById('tutorial-prev-btn').addEventListener('click', () => this.prev());
        document.getElementById('tutorial-never-btn').addEventListener('click', () => this.disableForever());
    },

    showStep(index) {
        if (!this.modalElement) return;

        this.currentStep = index;
        const step = this.steps[index];

        document.getElementById('tutorial-title').textContent = step.title;
        document.getElementById('tutorial-text').textContent = step.text;
        document.getElementById('tutorial-step-count').textContent = `${index + 1}/${this.steps.length}`;

        const imgContainer = document.getElementById('tutorial-image-container');
        const imgElement = document.getElementById('tutorial-image');

        if (step.image) {
            imgElement.src = step.image;
            imgContainer.style.display = 'block';
        } else {
            imgElement.src = '';
            imgContainer.style.display = 'none';
        }

        const prevBtn = document.getElementById('tutorial-prev-btn');
        const nextBtn = document.getElementById('tutorial-next-btn');

        prevBtn.style.visibility = index === 0 ? 'hidden' : 'visible';
        nextBtn.textContent = index === this.steps.length - 1 ? 'Finish' : 'Next';

        this.modalElement.style.display = 'block';
        this.positionCardAndHighlight(step);
    },

    positionCardAndHighlight(step) {
        const card = document.getElementById('tutorial-card');
        const targetEl = step.target ? document.querySelector(step.target) : null;

        const margin = 12;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (targetEl) {
            const rect = targetEl.getBoundingClientRect();

            this.highlightElement.style.display = 'block';
            this.highlightElement.style.top = `${Math.max(0, rect.top - 4)}px`;
            this.highlightElement.style.left = `${Math.max(0, rect.left - 4)}px`;
            this.highlightElement.style.width = `${Math.min(viewportWidth, rect.width + 8)}px`;
            this.highlightElement.style.height = `${Math.min(viewportHeight, rect.height + 8)}px`;

            const cardWidth = card.offsetWidth || 320;
            const cardHeight = card.offsetHeight || 200;

            let left = 0;
            let top = 0;

            if (step.position === "right") {
                left = rect.right + margin;
                if (left + cardWidth > viewportWidth - margin) {
                    left = rect.left - cardWidth - margin;
                }
            } else if (step.position === "left") {
                left = rect.left - cardWidth - margin;
                if (left < margin) {
                    left = rect.right + margin;
                }
            }

            top = rect.top;

            left = Math.max(margin, Math.min(left, viewportWidth - cardWidth - margin));
            top = Math.max(margin, Math.min(top, viewportHeight - cardHeight - margin));

            card.style.left = `${left}px`;
            card.style.top = `${top}px`;
            card.style.bottom = 'auto';
            card.style.transform = 'none';
        } else {
            this.highlightElement.style.display = 'none';
            card.style.top = '50%';
            card.style.left = '50%';
            card.style.bottom = 'auto';
            card.style.transform = 'translate(-50%, -50%)';
        }
    },

    next() {
        if (this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.close();
        }
    },

    prev() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    },

    close() {
        if (this.modalElement) {
            this.modalElement.style.display = 'none';
        }
        if (this.highlightElement) {
            this.highlightElement.style.display = 'none';
        }
    },

    disableForever() {
        localStorage.setItem(this.STORAGE_KEY, 'true');
        this.close();
    }
};

window.TutorialManager = TutorialManager;

document.addEventListener('DOMContentLoaded', () => {
    if (window.TutorialManager) {
        window.TutorialManager.init();
    }
});
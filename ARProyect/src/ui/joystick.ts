export class VirtualJoystick {
    private container: HTMLElement;
    private stick: HTMLElement;
    private rect: DOMRect;
    private isDragging: boolean = false;
    private center: { x: number, y: number } = { x: 0, y: 0 };

    // Outputs (-1 to 1)
    public deltaX: number = 0;
    public deltaY: number = 0;

    constructor(containerId: string) {
        const el = document.getElementById(containerId);
        if (!el) throw new Error(`Joystick container #${containerId} not found`);
        this.container = el;

        // Create stick element if not exists or use existing structure
        let stick = this.container.querySelector('.joystick-stick') as HTMLElement;
        if (!stick) {
            stick = document.createElement('div');
            stick.className = 'joystick-stick';
            this.container.appendChild(stick);
        }
        this.stick = stick;

        // Initialize state
        this.rect = this.container.getBoundingClientRect();
        this.center = {
            x: this.rect.width / 2,
            y: this.rect.height / 2
        };

        this.setupEvents();

        // Handle resize
        window.addEventListener('resize', () => {
            this.rect = this.container.getBoundingClientRect();
            this.center = {
                x: this.rect.width / 2,
                y: this.rect.height / 2
            };
        });
    }

    private setupEvents() {
        // Touch events
        this.container.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isDragging = true;
            this.handleMove(e.touches[0].clientX, e.touches[0].clientY);
        });

        document.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                e.preventDefault();
                this.handleMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: false });

        document.addEventListener('touchend', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.reset();
            }
        });

        // Mouse events
        this.container.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.isDragging = true;
            this.handleMove(e.clientX, e.clientY);
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                e.preventDefault();
                this.handleMove(e.clientX, e.clientY);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.reset();
            }
        });
    }

    private handleMove(clientX: number, clientY: number) {
        // Calculate offset from center
        const maxDist = this.rect.width / 2; // Radius

        let dx = clientX - this.rect.left - this.center.x;
        let dy = clientY - this.rect.top - this.center.y;

        // Calculate distance
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Clamp to radius
        if (distance > maxDist) {
            const angle = Math.atan2(dy, dx);
            dx = Math.cos(angle) * maxDist;
            dy = Math.sin(angle) * maxDist;
        }

        // Update stick position
        this.stick.style.transform = `translate(${dx}px, ${dy}px)`;

        // Normalize output (-1 to 1)
        this.deltaX = dx / maxDist;
        this.deltaY = dy / maxDist;
    }

    private reset() {
        this.stick.style.transform = `translate(0px, 0px)`;
        this.deltaX = 0;
        this.deltaY = 0;
    }
}

// State
let currentSlide = 1;
const totalSlides = 10;

// DOM Elements
const slidesContainer = document.querySelector('.slides-container');
const slides = document.querySelectorAll('.slide');
const prevButton = document.querySelector('.nav-button.prev');
const nextButton = document.querySelector('.nav-button.next');
const currentSlideSpan = document.querySelector('.current-slide');
const totalSlidesSpan = document.querySelector('.total-slides');
const navDotsContainer = document.querySelector('.nav-dots');
const navProgress = document.querySelector('.nav-progress');

// Initialize
function init() {
    totalSlidesSpan.textContent = totalSlides;
    createNavDots();
    updateSlide();
    attachEventListeners();
}

// Create navigation dots
function createNavDots() {
    for (let i = 1; i <= totalSlides; i++) {
        const dot = document.createElement('div');
        dot.classList.add('nav-dot');
        if (i === 1) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        navDotsContainer.appendChild(dot);
    }
}

// Update slide display
function updateSlide() {
    // Update slides
    slides.forEach((slide, index) => {
        slide.classList.remove('active', 'prev');
        if (index + 1 === currentSlide) {
            slide.classList.add('active');
        } else if (index + 1 < currentSlide) {
            slide.classList.add('prev');
        }
    });

    // Update counter
    currentSlideSpan.textContent = currentSlide;

    // Update nav dots
    const dots = document.querySelectorAll('.nav-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index + 1 === currentSlide);
    });

    // Update progress bar
    const progress = ((currentSlide - 1) / (totalSlides - 1)) * 100;
    const dotsWidth = navDotsContainer.offsetWidth;
    navProgress.style.width = `${(dotsWidth - 40) * (progress / 100)}px`;

    // Update button states
    prevButton.disabled = currentSlide === 1;
    nextButton.disabled = currentSlide === totalSlides;
    prevButton.style.opacity = currentSlide === 1 ? '0.5' : '1';
    nextButton.style.opacity = currentSlide === totalSlides ? '0.5' : '1';
}

// Navigate to specific slide
function goToSlide(slideNumber) {
    if (slideNumber >= 1 && slideNumber <= totalSlides) {
        currentSlide = slideNumber;
        updateSlide();
        playSlideAnimation();
    }
}

// Next slide
function nextSlide() {
    if (currentSlide < totalSlides) {
        currentSlide++;
        updateSlide();
        playSlideAnimation();
    }
}

// Previous slide
function prevSlide() {
    if (currentSlide > 1) {
        currentSlide--;
        updateSlide();
        playSlideAnimation();
    }
}

// Play slide animation
function playSlideAnimation() {
    const activeSlide = document.querySelector('.slide.active');
    const content = activeSlide.querySelector('.slide-content');
    
    // Reset animation
    content.style.animation = 'none';
    setTimeout(() => {
        content.style.animation = 'slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    }, 10);
}

// Event listeners
function attachEventListeners() {
    // Button clicks
    prevButton.addEventListener('click', prevSlide);
    nextButton.addEventListener('click', nextSlide);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                prevSlide();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ':
                e.preventDefault();
                nextSlide();
                break;
            case 'Home':
                goToSlide(1);
                break;
            case 'End':
                goToSlide(totalSlides);
                break;
        }
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    slidesContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    slidesContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                nextSlide();
            } else {
                // Swipe right - previous slide
                prevSlide();
            }
        }
    }

    // Mouse wheel navigation (optional)
    let isScrolling = false;
    slidesContainer.addEventListener('wheel', (e) => {
        if (isScrolling) return;
        
        isScrolling = true;
        setTimeout(() => {
            isScrolling = false;
        }, 800);

        if (e.deltaY > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
    }, { passive: true });

    // Hover effects for cards
    addHoverEffects();
}

// Add hover effects
function addHoverEffects() {
    // Add subtle parallax effect to cards
    const cards = document.querySelectorAll('.intro-card, .tech-item, .gesture-card, .challenge-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// Add floating animation to hero icon
function animateHeroIcon() {
    const heroIcon = document.querySelector('.hero-icon');
    if (heroIcon) {
        let angle = 0;
        setInterval(() => {
            angle += 0.02;
            const offset = Math.sin(angle) * 10;
            heroIcon.style.transform = `translateY(${offset}px) rotate(${Math.sin(angle * 0.5) * 5}deg)`;
        }, 50);
    }
}

// Add particle effect on hover
function createParticles(element) {
    element.addEventListener('mouseenter', () => {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.position = 'absolute';
                particle.style.width = '4px';
                particle.style.height = '4px';
                particle.style.background = 'var(--primary)';
                particle.style.borderRadius = '50%';
                particle.style.pointerEvents = 'none';
                
                const rect = element.getBoundingClientRect();
                particle.style.left = `${Math.random() * rect.width}px`;
                particle.style.top = `${Math.random() * rect.height}px`;
                
                element.style.position = 'relative';
                element.appendChild(particle);
                
                // Animate particle
                particle.animate([
                    { transform: 'translateY(0) scale(1)', opacity: 1 },
                    { transform: 'translateY(-50px) scale(0)', opacity: 0 }
                ], {
                    duration: 1000,
                    easing: 'ease-out'
                }).onfinish = () => particle.remove();
            }, i * 100);
        }
    });
}

// Progress bar animation
function animateProgress() {
    setInterval(() => {
        const progress = navProgress;
        if (progress) {
            progress.style.boxShadow = `0 0 ${10 + Math.sin(Date.now() * 0.003) * 5}px var(--primary)`;
        }
    }, 50);
}

// Auto-advance slides (optional - commented out by default)
// Uncomment to enable auto-advance every 10 seconds
/*
let autoAdvanceInterval;

function startAutoAdvance() {
    autoAdvanceInterval = setInterval(() => {
        if (currentSlide < totalSlides) {
            nextSlide();
        } else {
            goToSlide(1);
        }
    }, 10000);
}

function stopAutoAdvance() {
    clearInterval(autoAdvanceInterval);
}

// Pause auto-advance on user interaction
document.addEventListener('click', () => {
    stopAutoAdvance();
    setTimeout(startAutoAdvance, 30000); // Resume after 30s of inactivity
});
*/

// Easter egg: Press 'P' for presentation mode (full screen)
document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
});

// Add smooth reveal animation when elements come into view
function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.intro-card, .tech-item, .feature-big, .step, .challenge-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    init();
    animateHeroIcon();
    animateProgress();
    observeElements();
    
    // Optional: Add particle effects to tags
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => createParticles(tag));
    
    console.log('🎨 Presentación cargada. Usa las flechas ←/→ o los botones para navegar.');
    console.log('💡 Presiona "P" para modo pantalla completa.');
});

// Prevent context menu on right click (optional)
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

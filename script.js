// Portfolio JavaScript - Enhanced functionality
(function() {
    'use strict';

    // DOM Elements
    const elements = {
        progressBar: document.getElementById('progress'),
        navbar: document.getElementById('navbar'),
        navLinks: document.getElementById('navLinks'),
        mobileToggle: document.getElementById('mobileToggle'),
        contactForm: document.getElementById('contactForm'),
        formStatus: document.getElementById('formStatus'),
        currentYear: document.getElementById('currentYear'),
        revealElements: document.querySelectorAll('.reveal'),
        navLinkItems: document.querySelectorAll('.nav-link')
    };

    // Configuration
    const config = {
        scrollThreshold: 0.5,
        revealThreshold: 0.15,
        revealRootMargin: '0px 0px -50px 0px',
        debounceDelay: 10,
        animationDuration: 600
    };

    // State
    let isNavOpen = false;
    let currentSection = 'home';
    let scrollTimeout = null;

    // Utility Functions
    const utils = {
        debounce: (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        throttle: (func, limit) => {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        easeInOutCubic: (t) => {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        },

        getScrollProgress: () => {
            const winHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const trackLength = docHeight - winHeight;
            return Math.min(scrollTop / trackLength, 1);
        },

        smoothScrollTo: (target, duration = 800) => {
            const targetElement = document.querySelector(target);
            if (!targetElement) return;

            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            let startTime = null;

            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const run = utils.easeInOutCubic(timeElapsed / duration) * distance;
                
                window.scrollTo(0, startPosition + run);
                
                if (timeElapsed < duration) {
                    requestAnimationFrame(animation);
                }
            }
            requestAnimationFrame(animation);
        }
    };

    // Progress Bar Functionality
    const progressBar = {
        init: () => {
            if (!elements.progressBar) return;
            progressBar.update();
            window.addEventListener('scroll', utils.throttle(progressBar.update, config.debounceDelay), { passive: true });
            window.addEventListener('load', progressBar.update);
        },

        update: () => {
            const progress = utils.getScrollProgress() * 100;
            elements.progressBar.style.width = `${progress}%`;
        }
    };

    // Navigation Functionality
    const navigation = {
        init: () => {
            navigation.setupActiveState();
            navigation.setupMobileToggle();
            navigation.setupSmoothScroll();
            navigation.setupScrollSpy();
        },

        setupActiveState: () => {
            const sections = Array.from(elements.navLinkItems).map(link => {
                const href = link.getAttribute('href');
                return {
                    link,
                    section: document.querySelector(href),
                    id: href.replace('#', '')
                };
            }).filter(item => item.section);

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const sectionId = entry.target.id;
                        navigation.setActiveLink(sectionId);
                    }
                });
            }, {
                threshold: config.scrollThreshold,
                rootMargin: '-20% 0px -60% 0px'
            });

            sections.forEach(({ section }) => observer.observe(section));
        },

        setActiveLink: (sectionId) => {
            if (currentSection === sectionId) return;
            
            currentSection = sectionId;
            elements.navLinkItems.forEach(link => {
                const isActive = link.getAttribute('data-section') === sectionId;
                link.classList.toggle('active', isActive);
            });
        },

        setupMobileToggle: () => {
            if (!elements.mobileToggle) return;

            elements.mobileToggle.addEventListener('click', () => {
                isNavOpen = !isNavOpen;
                elements.mobileToggle.classList.toggle('active', isNavOpen);
                elements.navLinks.classList.toggle('active', isNavOpen);
                
                // Prevent body scroll when nav is open on mobile
                document.body.style.overflow = isNavOpen ? 'hidden' : '';
            });

            // Close mobile nav when clicking on a link
            elements.navLinkItems.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        navigation.closeMobileNav();
                    }
                });
            });

            // Close mobile nav when clicking outside
            document.addEventListener('click', (e) => {
                if (isNavOpen && !elements.navbar.contains(e.target)) {
                    navigation.closeMobileNav();
                }
            });
        },

        closeMobileNav: () => {
            isNavOpen = false;
            elements.mobileToggle.classList.remove('active');
            elements.navLinks.classList.remove('active');
            document.body.style.overflow = '';
        },

        setupSmoothScroll: () => {
            elements.navLinkItems.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = link.getAttribute('href');
                    utils.smoothScrollTo(target);
                    
                    // Update URL without jumping
                    history.pushState(null, null, target);
                });
            });
        },

        setupScrollSpy: () => {
            // Handle initial hash in URL
            if (window.location.hash) {
                setTimeout(() => {
                    const target = window.location.hash;
                    const targetElement = document.querySelector(target);
                    if (targetElement) {
                        utils.smoothScrollTo(target, 1000);
                    }
                }, 100);
            }
        }
    };

    // Reveal Animations
    const revealAnimations = {
        init: () => {
            if (!elements.revealElements.length) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add('show');
                        }, index * 50); // Stagger animation
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: config.revealThreshold,
                rootMargin: config.revealRootMargin
            });

            elements.revealElements.forEach(el => observer.observe(el));
        }
    };

    // Contact Form
    const contactForm = {
        init: () => {
            if (!elements.contactForm) return;
            elements.contactForm.addEventListener('submit', contactForm.handleSubmit);
        },

        handleSubmit: (e) => {
            e.preventDefault();
            
            const formData = new FormData(elements.contactForm);
            const data = Object.fromEntries(formData.entries());
            
            // Validate form data
            if (!contactForm.validateForm(data)) return;
            
            // Simulate form submission
            contactForm.simulateSubmission(data);
        },

        validateForm: (data) => {
            const { name, email, message } = data;
            
            if (!name.trim()) {
                contactForm.showStatus('Please enter your name.', 'error');
                return false;
            }
            
            if (!contactForm.isValidEmail(email)) {
                contactForm.showStatus('Please enter a valid email address.', 'error');
                return false;
            }
            
            if (!message.trim()) {
                contactForm.showStatus('Please enter your message.', 'error');
                return false;
            }
            
            return true;
        },

        isValidEmail: (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        simulateSubmission: (data) => {
            const submitButton = elements.contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            // Show loading state
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                contactForm.showStatus(
                    `Thanks, ${data.name}! I'll get back to you at ${data.email} soon.`,
                    'success'
                );
                elements.contactForm.reset();
                
                // Reset button
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }, 1500);
        },

        showStatus: (message, type) => {
            if (!elements.formStatus) return;
            
            elements.formStatus.textContent = message;
            elements.formStatus.className = `form-status ${type}`;
            
            // Hide status after 5 seconds
            setTimeout(() => {
                elements.formStatus.className = 'form-status';
            }, 5000);
        }
    };

    // Performance optimizations
    const performance = {
        init: () => {
            performance.lazyLoadImages();
            performance.preloadCriticalResources();
        },

        lazyLoadImages: () => {
            const images = document.querySelectorAll('img[loading="lazy"]');
            
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src || img.src;
                            img.classList.remove('lazy');
                            imageObserver.unobserve(img);
                        }
                    });
                });

                images.forEach(img => imageObserver.observe(img));
            }
        },

        preloadCriticalResources: () => {
            // Preload critical CSS and fonts
            const criticalResources = [
                'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
            ];

            criticalResources.forEach(resource => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'style';
                link.href = resource;
                document.head.appendChild(link);
            });
        }
    };

    // Accessibility enhancements
    const accessibility = {
        init: () => {
            accessibility.setupKeyboardNavigation();
            accessibility.setupFocusManagement();
            accessibility.setupReducedMotion();
        },

        setupKeyboardNavigation: () => {
            // Enable keyboard navigation for custom elements
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && isNavOpen) {
                    navigation.closeMobileNav();
                }
            });
        },

        setupFocusManagement: () => {
            // Ensure focus is visible
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    document.body.classList.add('keyboard-navigation');
                }
            });

            document.addEventListener('mousedown', () => {
                document.body.classList.remove('keyboard-navigation');
            });
        },

        setupReducedMotion: () => {
            // Respect user's motion preferences
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            if (prefersReducedMotion) {
                document.documentElement.style.scrollBehavior = 'auto';
                // Disable animations for users who prefer reduced motion
                const style = document.createElement('style');
                style.textContent = `
                    *, *::before, *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    };

    // Error handling
    const errorHandler = {
        init: () => {
            window.addEventListener('error', errorHandler.handleError);
            window.addEventListener('unhandledrejection', errorHandler.handlePromiseRejection);
        },

        handleError: (error) => {
            console.error('JavaScript Error:', error);
            // In production, you might want to send errors to a logging service
        },

        handlePromiseRejection: (event) => {
            console.error('Unhandled Promise Rejection:', event.reason);
            event.preventDefault(); // Prevent the default browser behavior
        }
    };

    
    // Initialize everything when DOM is ready
    const init = () => {
        try {
            // Set current year
            if (elements.currentYear) {
                elements.currentYear.textContent = new Date().getFullYear();
            }

            // Initialize all modules
            progressBar.init();
            navigation.init();
            revealAnimations.init();
            contactForm.init();
            performance.init();
            accessibility.init();
            errorHandler.init();

            console.log('Portfolio initialized successfully');
        } catch (error) {
            console.error('Error initializing portfolio:', error);
        }
    };

    // DOM Ready Check
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
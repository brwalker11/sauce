/**
 * Montañero Hot Sauce - Main JavaScript
 * Handles navigation, scroll effects, animations, and form interaction
 */

(function() {
    'use strict';

    // DOM Elements
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('nav-toggle');
    const navMobile = document.getElementById('nav-mobile');
    const navMobileLinks = document.querySelectorAll('.nav-mobile-link');
    const signupForm = document.getElementById('signup-form');
    const signupMessage = document.getElementById('signup-message');

    // State
    let isMenuOpen = false;

    /**
     * Initialize all functionality
     */
    function init() {
        setupNavScroll();
        setupMobileMenu();
        setupSmoothScroll();
        setupRevealAnimations();
        setupSignupForm();
    }

    /**
     * Navigation scroll effect
     * Adds solid background when user scrolls down
     */
    function setupNavScroll() {
        let lastScroll = 0;
        const scrollThreshold = 50;

        function handleScroll() {
            const currentScroll = window.scrollY;

            if (currentScroll > scrollThreshold) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        }

        // Throttle scroll events
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // Check initial scroll position
        handleScroll();
    }

    /**
     * Mobile menu toggle
     */
    function setupMobileMenu() {
        if (!navToggle || !navMobile) return;

        navToggle.addEventListener('click', toggleMenu);

        // Close menu when clicking a link
        navMobileLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                closeMenu();
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMenuOpen) {
                closeMenu();
            }
        });

        // Close menu on resize to desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 768 && isMenuOpen) {
                closeMenu();
            }
        });
    }

    function toggleMenu() {
        if (isMenuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    function openMenu() {
        isMenuOpen = true;
        navToggle.classList.add('active');
        navMobile.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        isMenuOpen = false;
        navToggle.classList.remove('active');
        navMobile.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Smooth scroll for anchor links
     */
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');

                // Skip if it's just "#"
                if (href === '#') return;

                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();

                    const navHeight = nav.offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /**
     * Reveal animations using Intersection Observer
     */
    function setupRevealAnimations() {
        const revealElements = document.querySelectorAll('.reveal');

        if (revealElements.length === 0) return;

        // Check if Intersection Observer is supported
        if (!('IntersectionObserver' in window)) {
            // Fallback: just show all elements
            revealElements.forEach(function(el) {
                el.classList.add('visible');
            });
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Stop observing once revealed
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach(function(el) {
            observer.observe(el);
        });
    }

    /**
     * Email signup form handling
     * Submits to Formspree for email collection
     */
    function setupSignupForm() {
        if (!signupForm) return;

        var FORMSPREE_ENDPOINT = 'https://formspree.io/f/xeegzwzw';

        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();

            var emailInput = signupForm.querySelector('.signup-input');
            var email = emailInput.value.trim();

            // Basic email validation
            if (!isValidEmail(email)) {
                showMessage('Please enter a valid email address.', 'error');
                return;
            }

            var button = signupForm.querySelector('.signup-button');
            var originalText = button.textContent;

            // Show loading state
            button.textContent = 'Signing up...';
            button.disabled = true;

            // Submit to Formspree
            fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email: email })
            })
            .then(function(response) {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Network response was not ok');
            })
            .then(function() {
                showMessage("You're on the list!", 'success');
                emailInput.value = '';
            })
            .catch(function() {
                showMessage('Something went wrong. Please try again.', 'error');
            })
            .finally(function() {
                button.textContent = originalText;
                button.disabled = false;
            });
        });
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showMessage(message, type) {
        if (!signupMessage) return;

        signupMessage.textContent = message;
        signupMessage.className = 'signup-message ' + type;

        // Clear message after 5 seconds
        setTimeout(function() {
            signupMessage.textContent = '';
            signupMessage.className = 'signup-message';
        }, 5000);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

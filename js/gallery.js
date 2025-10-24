/**
 * Café Zeit - Gallery & Lightbox
 * Image gallery with lightbox functionality
 */

(function() {
    'use strict';

    // ========================================
    // Lightbox Functionality
    // ========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const galleryItems = document.querySelectorAll('.gallery-item');

    let currentImageIndex = 0;
    let images = [];

    // Initialize gallery
    function initGallery() {
        galleryItems.forEach((item, index) => {
            const img = item.querySelector('img');
            const overlay = item.querySelector('.gallery-overlay');

            if (img) {
                images.push({
                    src: img.src,
                    alt: img.alt,
                    title: overlay ? overlay.querySelector('h3')?.textContent : '',
                    description: overlay ? overlay.querySelector('p')?.textContent : ''
                });

                // Click event to open lightbox
                item.addEventListener('click', () => {
                    openLightbox(index);
                });

                // Keyboard accessibility
                item.setAttribute('tabindex', '0');
                item.setAttribute('role', 'button');
                item.setAttribute('aria-label', `View image: ${img.alt}`);

                item.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openLightbox(index);
                    }
                });
            }
        });
    }

    // Open lightbox
    function openLightbox(index) {
        currentImageIndex = index;
        const image = images[index];

        lightboxImg.src = image.src;
        lightboxImg.alt = image.alt;

        const captionText = image.title ? `${image.title}${image.description ? ' - ' + image.description : ''}` : image.alt;
        lightboxCaption.textContent = captionText;

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling

        // Focus management for accessibility
        lightbox.setAttribute('aria-hidden', 'false');
        lightboxClose.focus();
    }

    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling

        lightbox.setAttribute('aria-hidden', 'true');

        // Return focus to the gallery item that was clicked
        if (galleryItems[currentImageIndex]) {
            galleryItems[currentImageIndex].focus();
        }
    }

    // Navigate to next image
    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        updateLightboxImage();
    }

    // Navigate to previous image
    function prevImage() {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        updateLightboxImage();
    }

    // Update lightbox image
    function updateLightboxImage() {
        const image = images[currentImageIndex];

        lightboxImg.style.opacity = '0';

        setTimeout(() => {
            lightboxImg.src = image.src;
            lightboxImg.alt = image.alt;

            const captionText = image.title ? `${image.title}${image.description ? ' - ' + image.description : ''}` : image.alt;
            lightboxCaption.textContent = captionText;

            lightboxImg.style.opacity = '1';
        }, 150);
    }

    // Event Listeners
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    // Close lightbox when clicking outside the image
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowRight':
                nextImage();
                break;
            case 'ArrowLeft':
                prevImage();
                break;
        }
    });

    // Touch events for mobile swipe
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next image
                nextImage();
            } else {
                // Swipe right - previous image
                prevImage();
            }
        }
    }

    // Add navigation arrows if there are multiple images
    if (images.length > 1) {
        const prevArrow = document.createElement('button');
        prevArrow.innerHTML = '&#10094;';
        prevArrow.className = 'lightbox-arrow lightbox-prev';
        prevArrow.setAttribute('aria-label', 'Previous image');
        prevArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            prevImage();
        });

        const nextArrow = document.createElement('button');
        nextArrow.innerHTML = '&#10095;';
        nextArrow.className = 'lightbox-arrow lightbox-next';
        nextArrow.setAttribute('aria-label', 'Next image');
        nextArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            nextImage();
        });

        if (lightbox) {
            lightbox.appendChild(prevArrow);
            lightbox.appendChild(nextArrow);
        }

        // Add arrow styles
        const arrowStyles = document.createElement('style');
        arrowStyles.textContent = `
            .lightbox-arrow {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(139, 64, 73, 0.8);
                color: white;
                border: none;
                font-size: 2.5rem;
                padding: 20px 15px;
                cursor: pointer;
                transition: all 0.3s ease;
                z-index: 10001;
                border-radius: 5px;
            }

            .lightbox-arrow:hover {
                background: rgba(139, 64, 73, 1);
                transform: translateY(-50%) scale(1.1);
            }

            .lightbox-prev {
                left: 30px;
            }

            .lightbox-next {
                right: 30px;
            }

            @media (max-width: 768px) {
                .lightbox-arrow {
                    font-size: 2rem;
                    padding: 15px 10px;
                }

                .lightbox-prev {
                    left: 15px;
                }

                .lightbox-next {
                    right: 15px;
                }
            }

            .lightbox-content {
                transition: opacity 0.15s ease;
            }
        `;
        document.head.appendChild(arrowStyles);
    }

    // Initialize gallery on page load
    initGallery();

    // ========================================
    // Image Counter
    // ========================================
    const counter = document.createElement('div');
    counter.className = 'lightbox-counter';
    counter.style.cssText = `
        position: absolute;
        top: 30px;
        left: 50px;
        color: white;
        font-size: 1.2rem;
        font-weight: 600;
        z-index: 10001;
        background: rgba(0, 0, 0, 0.5);
        padding: 10px 20px;
        border-radius: 5px;
    `;

    if (lightbox && images.length > 1) {
        lightbox.appendChild(counter);
    }

    // Update counter
    function updateCounter() {
        if (counter) {
            counter.textContent = `${currentImageIndex + 1} / ${images.length}`;
        }
    }

    // Override openLightbox to update counter
    const originalOpenLightbox = openLightbox;
    openLightbox = function(index) {
        originalOpenLightbox(index);
        updateCounter();
    };

    // Override updateLightboxImage to update counter
    const originalUpdateLightboxImage = updateLightboxImage;
    updateLightboxImage = function() {
        originalUpdateLightboxImage();
        updateCounter();
    };

    // ========================================
    // Preload adjacent images
    // ========================================
    function preloadAdjacentImages() {
        const nextIndex = (currentImageIndex + 1) % images.length;
        const prevIndex = (currentImageIndex - 1 + images.length) % images.length;

        [nextIndex, prevIndex].forEach(index => {
            const img = new Image();
            img.src = images[index].src;
        });
    }

    // Preload when lightbox opens or navigates
    lightbox.addEventListener('transitionend', () => {
        if (lightbox.classList.contains('active')) {
            preloadAdjacentImages();
        }
    });

    // ========================================
    // Gallery Filter Animation (Enhancement)
    // ========================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };

    const galleryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'scale(0.8)';

                setTimeout(() => {
                    entry.target.style.transition = 'all 0.5s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'scale(1)';
                }, 100 * Array.from(galleryItems).indexOf(entry.target));

                galleryObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    galleryItems.forEach(item => {
        galleryObserver.observe(item);
    });

    // ========================================
    // Console log for debugging
    // ========================================
    console.log(`Gallery initialized with ${images.length} images`);

})();

document.addEventListener('DOMContentLoaded', function() {
    // Original JavaScript code (Keep all the original code)
    const navLinks = document.querySelectorAll('.navbar a:not(.dropdown-content a)');
    const programLinks = document.querySelectorAll('.dropdown-content a');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Function to add diamonds to a section
    function addDiamonds(section) {
        // Check if the section already has diamonds
        if (!section.querySelector('.diamonds')) {
            // Create diamonds container
            const diamondsContainer = document.createElement('div');
            diamondsContainer.className = 'diamonds';
            
            // Create three diamonds
            const blueDiamond = document.createElement('div');
            blueDiamond.className = 'diamond blue';
            
            const goldDiamond = document.createElement('div');
            goldDiamond.className = 'diamond gold';
            
            const redDiamond = document.createElement('div');
            redDiamond.className = 'diamond red';
            
            // Add diamonds to container
            diamondsContainer.appendChild(blueDiamond);
            diamondsContainer.appendChild(goldDiamond);
            diamondsContainer.appendChild(redDiamond);
            
            // Insert diamonds after the first h1 in the section
            const h1 = section.querySelector('h1');
            if (h1) {
                h1.insertAdjacentElement('afterend', diamondsContainer);
            } else {
                // If no h1, insert at the beginning of section
                section.insertBefore(diamondsContainer, section.firstChild);
            }
        }
    }
    
    // Function to show section content
    function showSection(sectionId) {
        // Hide all sections
        contentSections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        
        // Show the selected section
        const selectedSection = document.getElementById(sectionId + '-section');
        if (selectedSection) {
            selectedSection.style.display = 'block';
            selectedSection.classList.add('active');
            
            // Add diamonds to the section
            addDiamonds(selectedSection);
        }
        
        // Update active state in navbar
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });
        
        // Reset program views if showing programs section
        if (sectionId === 'programs') {
            document.getElementById('all-programs').style.display = 'block';
            document.querySelectorAll('.single-program-view').forEach(view => {
                view.style.display = 'none';
            });
        }
    }
    
    // Function to show specific program
    function showProgram(programId) {
        // Hide all program views
        document.getElementById('all-programs').style.display = 'none';
        document.querySelectorAll('.single-program-view').forEach(view => {
            view.style.display = 'none';
        });
        
        // Show the selected program
        const programView = document.getElementById(programId + '-program');
        if (programView) {
            programView.style.display = 'block';
        }
        
        // Ensure the programs section is active
        contentSections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        
        const programsSection = document.getElementById('programs-section');
        programsSection.style.display = 'block';
        programsSection.classList.add('active');
        
        // Add diamonds to the programs section
        addDiamonds(programsSection);
        
        // Update active navbar link
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === 'programs') {
                link.classList.add('active');
            }
        });
    }
    
    // Add click event to navbar links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Add click event to program links
    programLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const program = this.getAttribute('data-program');
            showProgram(program);
        });
    });
    
    // SLIDESHOW FUNCTIONALITY
    // Variables for slideshow
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    let slideInterval;
    
    // Function to show a specific slide
    function showSlide(index) {
        // Reset active class on all slides and dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Update currentSlide index with bounds checking
        currentSlide = index;
        if (currentSlide >= slides.length) {
            currentSlide = 0;
        }
        if (currentSlide < 0) {
            currentSlide = slides.length - 1;
        }
        
        // Set active class on current slide and dot
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }
    
    // Function to advance to next slide
    function nextSlide() {
        showSlide(currentSlide + 1);
    }
    
    // Function to go to previous slide
    function prevSlide() {
        showSlide(currentSlide - 1);
    }
    
    // Set up auto-advancing slideshow
    function startSlideshow() {
        slideInterval = setInterval(nextSlide, 10000); // Change slide every 5 seconds
    }
    
    // Stop slideshow on user interaction
    function stopSlideshow() {
        clearInterval(slideInterval);
    }

    /* Add this to your JavaScript for mobile menu:
document.querySelector('.menu-toggle').addEventListener('click', function() {
    document.querySelector('.navbar-links').classList.toggle('active');
});
*/
    
    // Add event listeners for next and previous buttons
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    
    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', function() {
            stopSlideshow();
            nextSlide();
            startSlideshow();
        });
        
        prevBtn.addEventListener('click', function() {
            stopSlideshow();
            prevSlide();
            startSlideshow();
        });
    }
    
    // Add event listeners for dots
    dots.forEach(dot => {
        dot.addEventListener('click', function() {
            stopSlideshow();
            showSlide(parseInt(this.getAttribute('data-index')));
            startSlideshow();
        });
    });
    
    // Start the slideshow
    if (slides.length > 0) {
        startSlideshow();
    }
    
    // Change default section to home
    showSection('home');
    
    // If Programs link has active class, show programs section
    const programsLink = document.querySelector('.navbar a[data-section="programs"]');
    if (programsLink && programsLink.classList.contains('active')) {
        showSection('programs');
    }
});
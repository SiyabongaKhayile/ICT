document.addEventListener('DOMContentLoaded', function() {
    // Original JavaScript code (Keep all the original code)
    const navLinks = document.querySelectorAll('.navbar a:not(.dropdown-content a)');
    const programLinks = document.querySelectorAll('.dropdown-content a');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Firebase initialization
    firebase.initializeApp({
        apiKey: "AIzaSyBvLwOd23fTx6RpAuodsyFZwntry6AV9Ik",
        authDomain: "cvsystem-253f9.firebaseapp.com",
        projectId: "cvsystem-253f9",
        storageBucket: "cvsystem-253f9.appspot.com",
        messagingSenderId: "133527156661",
        appId: "1:133527156661:web:8d8794eeae33b16dabcbfc"
    });
    
    const db = firebase.firestore();
    
    // Fetch staff members from Firestore
    function loadStaffMembers() {
        const staffSection = document.getElementById('staff-section');
        
        if (!staffSection) return;
        
        // Get the staff container or create it if it doesn't exist
        let staffContainer = staffSection.querySelector('.staff-container');
        if (!staffContainer) {
            staffContainer = document.createElement('div');
            staffContainer.className = 'staff-container';
            
            // Insert after the diamonds
            const diamonds = staffSection.querySelector('.diamonds');
            if (diamonds) {
                diamonds.insertAdjacentElement('afterend', staffContainer);
            } else {
                staffSection.appendChild(staffContainer);
            }
        }
        
        // Clear existing content
        staffContainer.innerHTML = '<p class="loading-message">Loading staff information...</p>';
        
        // Get all staff documents
        db.collection('staff').get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    staffContainer.innerHTML = '<p>No staff information available</p>';
                    return;
                }
                
                // Clear loading message
                staffContainer.innerHTML = '';
                
                // Create an array to hold staff data
                const staffMembers = [];
                
                // Process each staff document
                querySnapshot.forEach((doc) => {
                    const staffData = doc.data();
                    staffMembers.push(staffData);
                });
                
                // Define position priority order - using a more robust approach
                const getPositionRank = (position) => {
                    // Convert to lowercase and trim for case-insensitive, whitespace-tolerant comparison
                    const pos = (position || '').toLowerCase().trim();
                    
                    if (pos.includes('head of office')) return 1;
                    if (pos.includes('department assistance')) return 2;
                    if (pos.includes('secretary')) return 3;
                    if (pos === 'lecturer') return 4;
                    if (pos.includes('junior lecturer')) return 5;
                    return 999; // Default for unknown positions
                };
                
                // Sort staff members based on position priority
                staffMembers.sort((a, b) => {
                    const rankA = getPositionRank(a.position);
                    const rankB = getPositionRank(b.position);
                    
                    return rankA - rankB;
                });
                
                // Log the sorted order for debugging
                console.log("Sorted staff members:", staffMembers.map(s => s.position));
                
                // Create and append staff cards in sorted order
                staffMembers.forEach((staffData) => {
                    // Create staff card
                    const staffCard = document.createElement('div');
                    staffCard.className = 'department-member';
                    
                    staffCard.innerHTML = `
                        <img src="${staffData.imageURL || '#'}" alt="${staffData.name}" class="member-image">
                        <div class="member-info">
                            <h3>${staffData.name}</h3>
                            <p><strong>${staffData.position}</strong></p>
                            <p>Office: ${staffData.office || 'N/A'}</p>
                            <p>Email: ${staffData.email || 'N/A'}</p>
                            <p>Tel. No.: ${staffData.phone || 'N/A'}</p>
                        </div>
                    `;
                    
                    staffContainer.appendChild(staffCard);
                });
            })
            .catch((error) => {
                console.error("Error fetching staff information: ", error);
                staffContainer.innerHTML = '<p>Error loading staff information. Please try again later.</p>';
            });
    }
    // Fetch timetables from Firestore
    function loadTimetables() {
        const timetableLinksContainer = document.querySelector('.timetable-links');
        
        if (!timetableLinksContainer) return;
        
        // Clear existing links
        timetableLinksContainer.innerHTML = '<p class="loading-message">Loading timetables...</p>';
        
        // Get timetables from Firestore
        db.collection('timetables').get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    timetableLinksContainer.innerHTML = '<p>No timetables available</p>';
                    return;
                }
                
                // Clear loading message
                timetableLinksContainer.innerHTML = '';
                
                querySnapshot.forEach((doc) => {
                    const timetableData = doc.data();
                    const timetableLink = document.createElement('a');
                    timetableLink.href = timetableData.pdfURL || '#'; // Changed from url to pdfURL
                    timetableLink.className = 'timetable-link';
                    timetableLink.textContent = timetableData.title || 'Timetable';
                    timetableLink.target = "_blank"; // Open in new tab
                    timetableLinksContainer.appendChild(timetableLink);
                });
            })
            .catch((error) => {
                console.error("Error fetching timetables: ", error);
                timetableLinksContainer.innerHTML = '<p>Error loading timetables. Please try again later.</p>';
            });
    }
    
    // Fetch prospectus, rules and registration info for quick links
    function loadQuickLinks() {
        const quickLinks = document.querySelectorAll('.quick-link');
        
        if (quickLinks.length === 0) return;
        
        // Load Prospectus
        db.collection('prospectus').doc('v2oUMq3Eu5hY1BHN8sgH').get()
            .then((doc) => {
                if (doc.exists && quickLinks[0]) {
                    const prospectusData = doc.data();
                    quickLinks[0].href = prospectusData.pdfURL || '#';
                    quickLinks[0].title = `${prospectusData.title} - ${prospectusData.year}`;
                    quickLinks[0].target = "_blank"; // Open in new tab
                }
            })
            .catch((error) => {
                console.error("Error fetching prospectus: ", error);
            });
        
        // Load Rules and Regulations
        db.collection('rules').doc('VkAqarYhEnTAIyKPASSE').get()
            .then((doc) => {
                if (doc.exists && quickLinks[1]) {
                    const rulesData = doc.data();
                    quickLinks[1].href = rulesData.pdfURL || '#';
                    quickLinks[1].title = `${rulesData.title} - ${rulesData.year}`;
                    quickLinks[1].target = "_blank"; // Open in new tab
                }
            })
            .catch((error) => {
                console.error("Error fetching rules: ", error);
            });
    }
    
    // Fetch slideshow events from Firestore
    function loadSlideshow() {
        const slidesContainer = document.querySelector('.slides');
        const dotsContainer = document.querySelector('.dots-container'); // Fixed selector
        
        if (!slidesContainer) return;
        
        // Clear existing slides
        slidesContainer.innerHTML = '<div class="slide loading-placeholder"><div class="slide-text"><h3>Loading events...</h3></div></div>';
        
        // Clear existing dots if they exist
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
        }
        
        // Get events from Firestore
        db.collection('events').limit(5).get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    slidesContainer.innerHTML = '<div class="slide active"><div class="slide-text"><h3>No events available</h3></div></div>';
                    return;
                }
                
                // Clear loading placeholder
                slidesContainer.innerHTML = '';
                
                let index = 0;
                querySnapshot.forEach((doc) => {
                    const eventData = doc.data();
                    
                    // Format date if available - handle as string
                    let formattedDate = '';
                    if (eventData.date) {
                        try {
                            // Try to parse the date string
                            const dateObj = new Date(eventData.date);
                            if (!isNaN(dateObj.getTime())) {
                                formattedDate = dateObj.toLocaleDateString('en-US', { 
                                    month: 'long', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                });
                            }
                        } catch (e) {
                            console.error("Error formatting date:", e);
                        }
                    }
                    
                    // Create slide element
                    const slide = document.createElement('div');
                    slide.className = index === 0 ? 'slide active' : 'slide';
                    
                    // Create slide content
                    slide.innerHTML = `
                        <img src="${eventData.imageURL || '#'}" alt="${eventData.title || 'Event Image'}">
                        <div class="slide-text">
                            <h3>${eventData.title || 'Event'}</h3>
                            ${formattedDate ? `<p class="event-date">${formattedDate}</p>` : ''}
                            <p>${eventData.description || ''}</p>
                        </div>
                    `;
                    
                    slidesContainer.appendChild(slide);
                    
                    // Create dot for this slide
                    if (dotsContainer) {
                        const dot = document.createElement('span');
                        dot.className = index === 0 ? 'dot active' : 'dot';
                        dot.setAttribute('data-index', index);
                        dotsContainer.appendChild(dot);
                    }
                    
                    index++;
                });
                
                // Re-initialize slideshow after loading new slides
                initializeSlideshow();
            })
            .catch((error) => {
                console.error("Error fetching events: ", error);
                slidesContainer.innerHTML = '<div class="slide active"><div class="slide-text"><h3>Error loading events</h3><p>Please try again later.</p></div></div>';
            });
    }
    
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
    let slides;
    let dots;
    let slideInterval;
    
    // Initialize slideshow functionality
    function initializeSlideshow() {
        // Get the updated slides and dots
        slides = document.querySelectorAll('.slide');
        dots = document.querySelectorAll('.dot');
        
        if (slides.length === 0) return;
        
        // Show first slide
        currentSlide = 0;
        showSlide(currentSlide);
        
        // Set up event listeners for dots
        dots.forEach(dot => {
            dot.addEventListener('click', function() {
                stopSlideshow();
                showSlide(parseInt(this.getAttribute('data-index')));
                startSlideshow();
            });
        });
        
        // Start the automatic slideshow
        startSlideshow();
    }
    
    // Function to show a specific slide
    function showSlide(index) {
        // Ensure slides and dots arrays exist
        if (!slides || !slides.length) return;
        
        // Reset active class on all slides
        slides.forEach(slide => slide.classList.remove('active'));
        
        // Update currentSlide index with bounds checking
        currentSlide = index;
        if (currentSlide >= slides.length) {
            currentSlide = 0;
        }
        if (currentSlide < 0) {
            currentSlide = slides.length - 1;
        }
        
        // Set active class on current slide
        slides[currentSlide].classList.add('active');
        
        // Update dots if they exist
        if (dots && dots.length) {
            dots.forEach(dot => dot.classList.remove('active'));
            if (dots[currentSlide]) { // Check if dot exists before accessing
                dots[currentSlide].classList.add('active');
            }
        }
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
        slideInterval = setInterval(nextSlide, 10000); // Change slide every 10 seconds
    }
    
    // Stop slideshow on user interaction
    function stopSlideshow() {
        clearInterval(slideInterval);
    }
    
    // Add event listeners for mobile menu
    const menuToggle = document.querySelector('.menu-toggle');
    const navbarLinks = document.querySelector('.navbar-links');
    
    if (menuToggle && navbarLinks) {
        menuToggle.addEventListener('click', function() {
            navbarLinks.classList.toggle('active');
        });
    }
    
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
    
    // Load content from Firestore
    loadTimetables();
    loadSlideshow();
    loadStaffMembers();
    loadQuickLinks();
    
    // Change default section to home
    showSection('home');
    
    // If Programs link has active class, show programs section
    const programsLink = document.querySelector('.navbar a[data-section="programs"]');
    if (programsLink && programsLink.classList.contains('active')) {
        showSection('programs');
    }
});
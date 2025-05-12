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
                
                // Define position priority order - FIXED TO HANDLE ALL POSITIONS CORRECTLY
                const getPositionRank = (position) => {
                    // Convert to lowercase and trim for case-insensitive, whitespace-tolerant comparison
                    const pos = (position || '').toLowerCase().trim();
                    
                    // Fixed position hierarchy
                    if (pos.includes('head of department')) return 1;
                    if (pos === 'head of office') return 2;
                    if (pos.includes('department assistance')) return 3;
                    if (pos.includes('secretary')) return 4;
                    if (pos === 'lecturer') return 5; // Fixed: Removed extra parenthesis
                    if (pos.includes('junior lecturer')) return 6;
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
                // Insert at the beginning of section
                section.insertBefore(diamondsContainer, section.firstChild);
            }
        }
    }
    
    // Function to show section content
    function showSection(sectionId) {
        console.log("Showing section:", sectionId); // Debug log
        
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
            
            // Load section-specific content if needed
            if (sectionId === 'sponsors') {
                loadSponsors();
            } else if (sectionId === 'staff') {
                loadStaffMembers();
            } else if (sectionId === 'timetables') {
                loadTimetables();
            }
        } else {
            console.error(`Section with ID "${sectionId}-section" not found`); // Debug log
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
            const allPrograms = document.getElementById('all-programs');
            if (allPrograms) {
                allPrograms.style.display = 'block';
            }
            document.querySelectorAll('.single-program-view').forEach(view => {
                view.style.display = 'none';
            });
        }
    }
    
    // Function to show specific program
    function showProgram(programId) {
        // Hide all program views
        const allPrograms = document.getElementById('all-programs');
        if (allPrograms) {
            allPrograms.style.display = 'none';
        }
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
        if (programsSection) {
            programsSection.style.display = 'block';
            programsSection.classList.add('active');
            
            // Add diamonds to the programs section
            addDiamonds(programsSection);
        }
        
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
    

// Function to load sponsors and arrange them in an oval
function loadSponsors() {
    console.log("Loading sponsors..."); // Debug log
    
    // Find the sponsors container
    const sponsorsSection = document.getElementById('sponsors-section');
    
    if (!sponsorsSection) {
        console.error("Sponsors section not found"); // Debug log
        return;
    }
    
    // Find or create the sponsors-container
    let sponsorsContainer = sponsorsSection.querySelector('.sponsors-container');
    if (!sponsorsContainer) {
        console.log("Creating sponsors container"); // Debug log
        sponsorsContainer = document.createElement('div');
        sponsorsContainer.className = 'sponsors-container';
        sponsorsSection.appendChild(sponsorsContainer);
    }
    
    console.log("Sponsors container found/created, proceeding to load sponsors"); // Debug log
    
    // Clear existing sponsors
    sponsorsContainer.innerHTML = '<p class="loading-message">Loading sponsors...</p>';
    
    // Get sponsors from Firestore
    db.collection('sponsors').get()
        .then((querySnapshot) => {
            console.log(`Found ${querySnapshot.size} sponsors`); // Debug log
            
            if (querySnapshot.empty) {
                sponsorsContainer.innerHTML = '<p>No sponsors available</p>';
                return;
            }
            
            // Clear loading message
            sponsorsContainer.innerHTML = '';
            
            // Create sponsors list container for oval layout - with better dimensions
            const sponsorsList = document.createElement('div');
            sponsorsList.className = 'sponsors-list';
            sponsorsList.style.position = 'relative';
            sponsorsList.style.width = '750px';  // Width for oval - slightly wider
            sponsorsList.style.height = '380px'; // Height for oval - slightly shorter for more oval shape
            sponsorsList.style.margin = '40px auto 20px'; // More space above to separate from text
            sponsorsContainer.appendChild(sponsorsList);
            
            // Get all sponsor data
            const sponsors = [];
            querySnapshot.forEach((doc) => {
                const sponsorData = doc.data();
                console.log("Sponsor data:", sponsorData); // Debug log
                sponsors.push(sponsorData);
            });
            
            // Calculate positions in an oval for each sponsor
            const totalSponsors = sponsors.length;
            
            // Adjust logo size based on number of sponsors to prevent overlap
            let logoSize = 120; // Default logo size
            if (totalSponsors > 12) {
                logoSize = 100;
            }
            if (totalSponsors > 16) {
                logoSize = 80;
            }
            
            sponsors.forEach((sponsorData, index) => {
                console.log("Processing sponsor:", sponsorData.name); // Debug log
                
                // Calculate position in oval
                const angleStep = (2 * Math.PI) / totalSponsors;
                const angle = index * angleStep;
                
                // Oval dimensions - horizontal radius larger than vertical radius for pronounced oval
                const radiusX = 320; // Horizontal radius - increased for wider oval
                const radiusY = 150; // Vertical radius - decreased for more oval shape
                
                // Calculate position along the oval
                const x = radiusX * Math.cos(angle) + 375; // Center X (adjusted for wider width)
                const y = radiusY * Math.sin(angle) + 190; // Center Y (adjusted for height)
                
                // Create sponsor element
                const sponsor = document.createElement('div');
                sponsor.className = 'sponsor-item';
                
                // Set size based on calculation above
                sponsor.style.width = `${logoSize}px`;
                sponsor.style.height = `${logoSize}px`;
                
                // Position absolutely within the oval
                sponsor.style.position = 'absolute';
                sponsor.style.left = `${x - (logoSize/2)}px`; // Center the item
                sponsor.style.top = `${y - (logoSize/2)}px`;  // Center the item
                
                // Add level class if available
                if (sponsorData.level) {
                    sponsor.classList.add(sponsorData.level.toLowerCase());
                }
                
                // Create logo container - SQUARE INSTEAD OF ROUND
                const logoContainer = document.createElement('div');
                logoContainer.className = 'sponsor-logo-container';
                logoContainer.style.width = `${logoSize * 0.8}px`; // Adjust to logo size
                logoContainer.style.height = `${logoSize * 0.8}px`; // Adjust to logo size
                logoContainer.style.borderRadius = '0'; // Square corners instead of circle
                
                // Create logo image - ensure proper rendering in square
                const logoImg = document.createElement('img');
                logoImg.src = sponsorData.logoURL || '#';
                logoImg.alt = sponsorData.name || 'Sponsor';
                logoImg.className = 'sponsor-logo';
                logoImg.style.width = '90%';
                logoImg.style.height = '90%';
                logoImg.style.objectFit = 'contain';
                logoImg.onerror = function() {
                    this.src = 'images/placeholder-logo.png'; // Fallback image
                    console.log("Image failed to load for:", sponsorData.name);
                };
                
                // Add logo to container
                logoContainer.appendChild(logoImg);
                
                // Create name element
                const nameElem = document.createElement('p');
                nameElem.className = 'sponsor-name';
                nameElem.textContent = sponsorData.name || 'Sponsor';
                nameElem.style.fontSize = `${logoSize * 0.12}px`; // Proportional font size
                
                // Add elements to sponsor
                sponsor.appendChild(logoContainer);
                sponsor.appendChild(nameElem);
                
                // Add click handler if website URL is available
                if (sponsorData.websiteURL) {
                    sponsor.style.cursor = 'pointer';
                    sponsor.addEventListener('click', function() {
                        window.open(sponsorData.websiteURL, '_blank');
                    });
                    
                    // Add tooltip
                    sponsor.title = `Visit ${sponsorData.name} website`;
                }
                
                // Add sponsor to container
                sponsorsList.appendChild(sponsor);
            });
            
            console.log("Sponsors loaded successfully"); // Debug log
        })
        .catch((error) => {
            console.error("Error fetching sponsors: ", error);
            sponsorsContainer.innerHTML = '<p>Error loading sponsors. Please try again later.</p>';
        });
}

// No need for addSponsorsTitle since the HTML already has <h1>Our Sponsors</h1>

// Call function when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadSponsors();
});


    // FIXED: Load content from Firestore BEFORE showing home section
    Promise.all([
        new Promise(resolve => {
            loadTimetables();
            resolve();
        }),
        new Promise(resolve => {
            loadSlideshow();
            resolve();
        }),
        new Promise(resolve => {
            loadStaffMembers();
            resolve();
        }),
        new Promise(resolve => {
            loadQuickLinks();
            resolve();
        }),
        // Pre-load sponsors data
        new Promise(resolve => {
            loadSponsors();
            resolve();
        })
    ]).then(() => {
        console.log("All content loaded, now showing home section"); // Debug log
        // Show home section after all content is loaded
        showSection('home');
        
        // Add active class to home link in navbar
        const homeLink = document.querySelector('.navbar a[data-section="home"]');
        if (homeLink) {
            homeLink.classList.add('active');
        }
    }).catch(error => {
        console.error("Error loading content:", error);
        // Show home section anyway even if there's an error
        showSection('home');
    });
    
    // Hide the loading overlay once everything is loaded
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
});
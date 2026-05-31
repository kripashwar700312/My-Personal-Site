// Function to calculate exact difference in years, months, and days
function getExperienceParts(startDate) {
    const now = new Date();
    let years = now.getFullYear() - startDate.getFullYear();
    let months = now.getMonth() - startDate.getMonth();
    let days = now.getDate() - startDate.getDate();

    if (days < 0) {
        months -= 1;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) {
        years -= 1;
        months += 12;
    }
    
    return { years, months, days };
}

// Function to mount the calculated experience to the DOM
function setExperienceStatic() {
    const el = document.getElementById("experience-counter");
    if (!el) return;
    
    // Start date set to December 16, 2018
    const startDate = new Date("2018-12-16");
    const { years, months, days } = getExperienceParts(startDate);
    
    // Inject innerHTML with customized tailwind span styling for the unit labels
    el.innerHTML = `${years} <span class="text-lg text-gray-400 font-normal">yrs</span>, 
                    ${months} <span class="text-lg text-gray-400 font-normal">mos</span>, 
                    ${days} <span class="text-lg text-gray-400 font-normal">days</span>`;
}

// Execute once DOM is fully loaded
document.addEventListener("DOMContentLoaded", setExperienceStatic);

function getAboutExperienceText(startDate) {
    const now = new Date();

    // Calculate difference
    let years = now.getFullYear() - startDate.getFullYear();
    let months = now.getMonth() - startDate.getMonth();

    // Adjust for partial months
    if (months < 0) {
        years -= 1;
        months += 12;
    }

    // Convert number to word for elegance (e.g., 7 -> "seven")
    const numToWord = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
    const yearWord = numToWord[years] || years;

    // Logic: If 6 months or more, it's considered "and a half"
    const halfSuffix = months >= 6 ? " and a half" : "";

    return `over ${yearWord}${halfSuffix} years`;
}

// Usage in your update function:
const aboutText = getAboutExperienceText(new Date("2018-12-16"));
document.getElementById("dynamic-about-exp").textContent = aboutText;


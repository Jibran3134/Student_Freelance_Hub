// Pakistani Professional Profile Images

export const MALE_PROFILE_IMAGES = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150",
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150",
    "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&h=150",
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&h=150",
    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=150&h=150"
];

export const FEMALE_PROFILE_IMAGES = [
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150",
    "https://images.unsplash.com/photo-1573496359-136d47552640?auto=format&fit=crop&w=150&h=150",
    "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=150&h=150",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150"
];

// Common Pakistani female names (for detection)
const FEMALE_NAMES = [
    'ayesha', 'fatima', 'zainab', 'maryam', 'sarah', 'aisha', 'hira', 'sana',
    'amna', 'alishba', 'mahnoor', 'iqra', 'noor', 'laiba', 'khadija', 'zara',
    'hina', 'rabia', 'sidra', 'amina', 'anum', 'maria', 'mehwish', 'farah',
    'asma', 'nimra', 'sadia', 'arooj', 'hafsa', 'iram', 'uzma', 'samina',
    'nida', 'ayeza', 'areeba', 'salma', 'sehrish', 'shazia', 'naila', 'rubab'
];

// Function to detect if a name is likely female
function isFemaleBasedOnName(name) {
    if (!name || typeof name !== 'string') return false;

    const nameLower = name.toLowerCase().trim();

    // Check if the name contains any common female name
    return FEMALE_NAMES.some(femaleName =>
        nameLower.includes(femaleName) || femaleName.includes(nameLower)
    );
}

// Get random profile image based on name (gender-appropriate)
export const getRandomProfileImage = (name = "") => {
    const isFemale = isFemaleBasedOnName(name);
    const imageArray = isFemale ? FEMALE_PROFILE_IMAGES : MALE_PROFILE_IMAGES;
    const randomIndex = Math.floor(Math.random() * imageArray.length);
    return imageArray[randomIndex];
};

// For backward compatibility - returns a random image from combined pool
export const getRandomProfileImageLegacy = () => {
    const allImages = [...MALE_PROFILE_IMAGES, ...FEMALE_PROFILE_IMAGES];
    const randomIndex = Math.floor(Math.random() * allImages.length);
    return allImages[randomIndex];
};

export const calculateCompatibility = (myPrefs: any, theirPrefs: any) => {
    if (!myPrefs || !theirPrefs) return 0;

    let score = 0;

    // 1. Cleanliness (30%)
    const cleanMap: any = { 'low': 1, 'medium': 2, 'high': 3 };
    const myClean = cleanMap[myPrefs.cleanliness_level?.toLowerCase()] || 2;
    const theirClean = cleanMap[theirPrefs.cleanliness_level?.toLowerCase()] || 2;
    
    const diff = Math.abs(myClean - theirClean);
    if (diff === 0) score += 30;
    else if (diff === 1) score += 15;

    // 2. Smoking (20%)
    if (myPrefs.smoking === theirPrefs.smoking) score += 20;

    // 3. Sleep Schedule (20%)
    if (myPrefs.sleep_schedule === theirPrefs.sleep_schedule) score += 20;

    // 4. Guests (15%)
    if (myPrefs.guests_allowed === theirPrefs.guests_allowed) score += 15;

    // 5. Pets (10%)
    if (myPrefs.pets === theirPrefs.pets) score += 10;

    // 6. Interest Tags (5%)
    // Simple check: do they share any interest tags?
    if (myPrefs.other_interests && theirPrefs.other_interests) {
        const myTags = myPrefs.other_interests.toLowerCase().split(',');
        const theirTags = theirPrefs.other_interests.toLowerCase().split(',');
        const hasCommon = myTags.some((tag: string) => theirTags.includes(tag.trim()));
        if (hasCommon) score += 5;
    }

    return score;
};
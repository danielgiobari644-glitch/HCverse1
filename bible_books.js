/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const BIBLE_BOOKS = [
  { name: "Genesis", chapters: 50, category: "Old Testament" },
  { name: "Exodus", chapters: 40, category: "Old Testament" },
  { name: "Leviticus", chapters: 27, category: "Old Testament" },
  { name: "Numbers", chapters: 36, category: "Old Testament" },
  { name: "Deuteronomy", chapters: 34, category: "Old Testament" },
  { name: "Joshua", chapters: 24, category: "Old Testament" },
  { name: "Judges", chapters: 21, category: "Old Testament" },
  { name: "Ruth", chapters: 4, category: "Old Testament" },
  { name: "1 Samuel", chapters: 31, category: "Old Testament" },
  { name: "2 Samuel", chapters: 24, category: "Old Testament" },
  { name: "1 Kings", chapters: 22, category: "Old Testament" },
  { name: "2 Kings", chapters: 25, category: "Old Testament" },
  { name: "1 Chronicles", chapters: 29, category: "Old Testament" },
  { name: "2 Chronicles", chapters: 36, category: "Old Testament" },
  { name: "Ezra", chapters: 10, category: "Old Testament" },
  { name: "Nehemiah", chapters: 13, category: "Old Testament" },
  { name: "Esther", chapters: 10, category: "Old Testament" },
  { name: "Job", chapters: 42, category: "Old Testament" },
  { name: "Psalms", chapters: 150, category: "Old Testament" },
  { name: "Proverbs", chapters: 31, category: "Old Testament" },
  { name: "Ecclesiastes", chapters: 12, category: "Old Testament" },
  { name: "Song of Solomon", chapters: 8, category: "Old Testament" },
  { name: "Isaiah", chapters: 66, category: "Old Testament" },
  { name: "Jeremiah", chapters: 52, category: "Old Testament" },
  { name: "Lamentations", chapters: 5, category: "Old Testament" },
  { name: "Ezekiel", chapters: 48, category: "Old Testament" },
  { name: "Daniel", chapters: 12, category: "Old Testament" },
  { name: "Hosea", chapters: 14, category: "Old Testament" },
  { name: "Joel", chapters: 3, category: "Old Testament" },
  { name: "Amos", chapters: 9, category: "Old Testament" },
  { name: "Obadiah", chapters: 1, category: "Old Testament" },
  { name: "Jonah", chapters: 4, category: "Old Testament" },
  { name: "Micah", chapters: 7, category: "Old Testament" },
  { name: "Nahum", chapters: 3, category: "Old Testament" },
  { name: "Habakkuk", chapters: 3, category: "Old Testament" },
  { name: "Zephaniah", chapters: 3, category: "Old Testament" },
  { name: "Haggai", chapters: 2, category: "Old Testament" },
  { name: "Zechariah", chapters: 14, category: "Old Testament" },
  { name: "Malachi", chapters: 4, category: "Old Testament" },
  { name: "Matthew", chapters: 28, category: "New Testament" },
  { name: "Mark", chapters: 16, category: "New Testament" },
  { name: "Luke", chapters: 24, category: "New Testament" },
  { name: "John", chapters: 21, category: "New Testament" },
  { name: "Acts", chapters: 28, category: "New Testament" },
  { name: "Romans", chapters: 16, category: "New Testament" },
  { name: "1 Corinthians", chapters: 16, category: "New Testament" },
  { name: "2 Corinthians", chapters: 13, category: "New Testament" },
  { name: "Galatians", chapters: 6, category: "New Testament" },
  { name: "Ephesians", chapters: 6, category: "New Testament" },
  { name: "Philippians", chapters: 4, category: "New Testament" },
  { name: "Colossians", chapters: 4, category: "New Testament" },
  { name: "1 Thessalonians", chapters: 5, category: "New Testament" },
  { name: "2 Thessalonians", chapters: 3, category: "New Testament" },
  { name: "1 Timothy", chapters: 6, category: "New Testament" },
  { name: "2 Timothy", chapters: 4, category: "New Testament" },
  { name: "Titus", chapters: 3, category: "New Testament" },
  { name: "Philemon", chapters: 1, category: "New Testament" },
  { name: "Hebrews", chapters: 13, category: "New Testament" },
  { name: "James", chapters: 5, category: "New Testament" },
  { name: "1 Peter", chapters: 5, category: "New Testament" },
  { name: "2 Peter", chapters: 3, category: "New Testament" },
  { name: "1 John", chapters: 5, category: "New Testament" },
  { name: "2 John", chapters: 1, category: "New Testament" },
  { name: "3 John", tracks: 1, category: "New Testament" },
  { name: "Jude", chapters: 1, category: "New Testament" },
  { name: "Revelation", chapters: 22, category: "New Testament" }
];

export const OFFLINE_VERSES = {
  "Genesis 1": [
    { verse: 1, text: "In the beginning God created the heaven and the earth." },
    { verse: 2, text: "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters." },
    { verse: 3, text: "And God said, Let there be light: and there was light." },
    { verse: 27, text: "So God created man in his own image, in the image of God created he him; male and female created he them." }
  ],
  "Psalms 23": [
    { verse: 1, text: "The LORD is my shepherd; I shall not want." },
    { verse: 2, text: "He maketh me to lie down in green pastures: he leadeth me beside the still waters." },
    { verse: 3, text: "He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake." },
    { verse: 4, text: "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me." },
    { verse: 5, text: "Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over." },
    { verse: 6, text: "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever." }
  ],
  "John 1": [
    { verse: 1, text: "In the beginning was the Word, and the Word was with God, and the Word was God." },
    { verse: 2, text: "The same was in the beginning with God." },
    { verse: 3, text: "All things were made by him; and without him was not any thing made that was made." },
    { verse: 4, text: "In him was life; and the life was the light of men." },
    { verse: 14, text: "And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth." }
  ],
  "Romans 8": [
    { verse: 1, text: "There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit." },
    { verse: 28, text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose." },
    { verse: 31, text: "What shall we then say to these things? If God be for us, who can be against us?" },
    { verse: 38, text: "For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come," },
    { verse: 39, text: "Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord." }
  ]
};

export async function fetchChapterText(book, chapter) {
  try {
    const response = await fetch(`https://bible-api.com/${encodeURIComponent(book)}+${chapter}`);
    if (!response.ok) throw new Error("Network offline or chapter not found");
    const data = await response.json();
    return data.verses.map(v => ({ verse: v.verse, text: v.text }));
  } catch (err) {
    const localKey = `${book} ${chapter}`;
    if (OFFLINE_VERSES[localKey]) {
      return OFFLINE_VERSES[localKey];
    }
    // Return custom generated backup so the user always has a high-quality seamless experience
    return [
      { verse: 1, text: `[Online Fetch offline] Reading ${book} Chapter ${chapter}.` },
      { verse: 2, text: "Thy word is a lamp unto my feet, and a light unto my path. (Psalms 119:105)" },
      { verse: 3, text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. (Proverbs 3:5)" }
    ];
  }
}

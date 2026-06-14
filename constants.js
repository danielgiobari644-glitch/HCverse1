export const SUPER_ADMIN_EMAIL = 'danielgiobari644@gmail.com';

export const SCRIPTURES = [
  { text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.", ref: "John 3:16" },
  { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
  { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
  { text: "Trust in the Lord with all your heart, and do not lean on your own understanding.", ref: "Proverbs 3:5" },
  { text: "Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.", ref: "Joshua 1:9" },
  { text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose.", ref: "Romans 8:28" },
  { text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.", ref: "Jeremiah 29:11" },
  { text: "The Lord is my light and my salvation; whom shall I fear? The Lord is the stronghold of my life; of whom shall I be afraid?", ref: "Psalm 27:1" },
  { text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.", ref: "Isaiah 40:31" },
  { text: "Come to me, all who labor and are heavy laden, and I will give you rest.", ref: "Matthew 11:28" },
  { text: "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control; against such things there is no law.", ref: "Galatians 5:22-23" },
  { text: "He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God.", ref: "Micah 6:8" }
];

export const EVENT_TYPES = {
  service: { label: 'Service', color: '#7c3aed', dotClass: 'bg-[var(--spiritual)]' },
  bible_study: { label: 'Bible Study', color: '#3b82f6', dotClass: 'bg-[var(--worship)]' },
  youth: { label: 'Youth', color: '#10b981', dotClass: 'bg-[var(--grace)]' },
  prayer: { label: 'Prayer', color: '#ec4899', dotClass: 'bg-[var(--faith)]' },
  fellowship: { label: 'Fellowship', color: '#6366f1', dotClass: 'bg-[var(--divine)]' },
  outreach: { label: 'Outreach', color: '#d97706', dotClass: 'bg-[var(--gold)]' }
};

export const ROLE_COLORS = {
  super_admin: 'text-red-500 bg-red-500/10 font-medium px-2 py-0.5 rounded-full text-xs border border-red-500/20',
  pastor: 'text-amber-500 bg-amber-500/10 font-medium px-2 py-0.5 rounded-full text-xs border border-amber-500/20',
  cell_leader: 'text-purple-500 bg-purple-500/10 font-medium px-2 py-0.5 rounded-full text-xs border border-purple-500/20',
  moderator: 'text-blue-500 bg-blue-500/10 font-medium px-2 py-0.5 rounded-full text-xs border border-blue-500/20',
  member: 'text-gray-500 bg-gray-500/10 font-medium px-2 py-0.5 rounded-full text-xs border border-gray-500/20'
};

export const QUIZ_QUESTIONS = [
  {
    question: "Who built the ark?",
    options: ["Abraham", "Noah", "Moses", "David"],
    correctAnswer: 1
  },
  {
    question: "How many books are in the Holy Bible?",
    options: ["55", "66", "77", "88"],
    correctAnswer: 1
  },
  {
    question: "Who was thrown into the lions' den?",
    options: ["Samson", "Joseph", "Daniel", "Elijah"],
    correctAnswer: 2
  },
  {
    question: "What is the very first book of the Bible?",
    options: ["Exodus", "Genesis", "Matthew", "Psalms"],
    correctAnswer: 1
  },
  {
    question: "Who parted the Red Sea by God's power?",
    options: ["Joshua", "Aaron", "Moses", "Gideon"],
    correctAnswer: 2
  },
  {
    question: "Where was Jesus born?",
    options: ["Nazareth", "Jerusalem", "Bethlehem", "Rome"],
    correctAnswer: 2
  },
  {
    question: "How many disciples did Jesus choose?",
    options: ["10", "11", "12", "14"],
    correctAnswer: 2
  },
  {
    question: "Who betrayed Jesus for thirty pieces of silver?",
    options: ["Peter", "Judas Iscariot", "Thomas", "John"],
    correctAnswer: 1
  },
  {
    question: "What is the last book of the New Testament?",
    options: ["Jude", "Revelation", "Hebrews", "Acts"],
    correctAnswer: 1
  },
  {
    question: "Who was the first man created?",
    options: ["Noah", "Adam", "Abraham", "Moses"],
    correctAnswer: 1
  }
];

export function getGreeting() {
  const hr = new Date().getHours();
  if (hr < 12) {
    return { text: "Good Morning", emoji: "🌅" };
  } else if (hr < 17) {
    return { text: "Good Afternoon", emoji: "☀️" };
  } else {
    return { text: "Good Evening", emoji: "🌌" };
  }
}

export function timeAgo(date) {
  if (!date) return 'just now';
  let ms = 0;
  if (typeof date === 'object' && date?.toMillis) {
    ms = date.toMillis();
  } else if (date instanceof Date) {
    ms = date.getTime();
  } else if (typeof date === 'object' && date?.seconds) {
    ms = date.seconds * 1000;
  } else {
    ms = new Date(date).getTime();
  }

  const sec = Math.floor((Date.now() - ms) / 1000);
  if (isNaN(sec) || sec < 5) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(ms).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export const COMMUNITY_EMOJIS = [
  '❤️', '🙏', '👏', '💒', '🎉', '😊', '💪', '🔥', '✝️', '🕊️', '📖', '🙌', '🌟', '💝', '💯', '✨'
];

export const PRAYER_EMOJIS = [
  '🙏', '❤️', '🕊️', '✝️', '💪', '🕯️', '✨', '💖', '🙌'
];

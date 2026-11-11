// Cards in the "How to Use Remember" deck that every new user gets.
// Existing tutorial decks are brought up to date on server start (see services/tutorial.ts).
export const TUTORIAL_DECK_TITLE = 'How to Use Remember';

export const TUTORIAL_CARDS: { title: string; descriptions: string }[] = [
  {
    title: 'What is Remember?',
    descriptions: 'Remember is a flashcard app for studying and memorizing anything. You make decks of question and answer cards, study them, group decks into folders, quiz yourself, and track how much time you spend.',
  },
  {
    title: 'How do I get around the app?',
    descriptions: 'Click the bookmark icon in the top-right corner to open the side menu. From there you can go to Home, Study, Folders, Quiz and Browse. System holds Logout and Deactivate Account. The breadcrumb at the top takes you back a step.',
  },
  {
    title: 'How do I create a deck?',
    descriptions: 'On the Home page, scroll to Create Main Cards. Type a deck title, attach a spreadsheet if you have one (or leave it empty and add cards later), then click Create Master Card. Your new deck shows up on the Study page.',
  },
  {
    title: 'How do I import cards from a spreadsheet?',
    descriptions: 'Use an Excel (.xlsx) or CSV file. Row 1 can be a header such as "Question | Answer | Link" and is skipped. Column A is the question, column B is the answer, column C is an optional "learn more" link, column D is an optional review flag (yes/no), and columns E, F and onward are optional wrong answers that look similar but are incorrect (used in multiple-choice quizzes). When you create a deck from Home, the first sheet becomes the deck and the title starts as the file name. Inside a deck, Add Cards > Upload File adds cards to that deck and updates any question that is already there.',
  },
  {
    title: 'How do I add cards to an existing deck?',
    descriptions: 'Open the deck from the Study page and click + Add Cards. Type a question, an answer (up to 5,000 characters) and an optional link, or switch to the Upload File tab to add many cards at once.',
  },
  {
    title: 'How do I study a deck?',
    descriptions: 'Open a deck and click a card to flip it and see the answer. Try to recall the answer before you flip. Use Shuffle to mix up the order, Reset Cards to turn every card back over, and the search box to find a question. Each flip counts as a view.',
  },
  {
    title: 'How do I edit or delete cards?',
    descriptions: 'Hover over a card to see the edit (pencil) and delete (X) icons. Edit opens a dialog where you can change the question, answer and link. Delete asks you to confirm first. Cards in a deck that is shared publicly cannot be changed.',
  },
  {
    title: 'What are folders?',
    descriptions: 'A folder groups several decks together, for example one folder for an exam with a deck per topic. Open Folders from the side menu, type a name and click Create folder, then use Add decks to tick the decks you want in it. A deck can be in more than one folder, and deleting a folder never deletes its decks.',
  },
  {
    title: 'How does quiz mode work?',
    descriptions: 'Open Quiz from the side menu, or click Start quiz on a folder. Pick the folder, leave out any decks you want to skip, and choose how many questions (10, 20, 50 or all). The questions are drawn at random from every deck in the folder.',
  },
  {
    title: 'What is the difference between the two quiz modes?',
    descriptions: 'Multiple choice shows four answers. The wrong ones come from the card\'s own saved wrong answers first, and any gap is filled with answers from other cards in the same folder. Add or remove a card\'s wrong answers when you add or edit it. Press 1-4 to answer and Enter for the next question. Flashcard mode shows only the question. You reveal the answer and mark yourself right (Y) or wrong (N).',
  },
  {
    title: 'What happens at the end of a quiz?',
    descriptions: 'You see your score, plus a list of every question you missed with the correct answer and its learn-more link. Click Retry missed to quiz yourself again on only those questions, or New quiz to start over.',
  },
  {
    title: 'How do I track my progress?',
    descriptions: 'The Home page lists your decks by views and shows a chart of the top 5. Time spent studying a deck is recorded each day. Inside a deck, a pie chart shows which cards you view the most.',
  },
  {
    title: 'How do I change card size?',
    descriptions: 'Use the size slider above your cards to change how many cards show per row.',
  },
  {
    title: 'How do I share a deck publicly?',
    descriptions: 'On the Study page, click the share icon on a deck to make it public. You can share up to 5 decks. Click the icon again to unshare. Decks you copied from someone else cannot be shared again.',
  },
  {
    title: 'How do I browse and copy public decks?',
    descriptions: 'Open Browse to see decks other people shared. Click a deck to study it, or use the copy button to add your own copy to the Study page. Copies can then go into your folders and quizzes.',
  },
];

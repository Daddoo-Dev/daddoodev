export type StoryChoice = {
	label: string;
	to: string;
};

export type StoryNode = {
	id: string;
	text: string;
	choices: StoryChoice[];
};

export type StoryGender = 'male' | 'female';

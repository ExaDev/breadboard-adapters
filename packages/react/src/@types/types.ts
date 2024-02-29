export type BreadboardContextType = {
	value: number;
	incrementNumber: () => void;
}

export type BreadboardProviderProps = {
	children: React.ReactNode;
}
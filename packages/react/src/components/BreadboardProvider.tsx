
import { BreadboardProviderProps } from "../@types/types";
import { BreadboardContext } from "./BreadboardContext";
import { Breadboard } from "@google-labs/breadboard";


const BreadboardProvider: React.FC<BreadboardProviderProps> = ({ children }) => {
	const board:Breadboard | null = null;

	return (
		<BreadboardContext.Provider value={{ board }}>
			{children}
		</BreadboardContext.Provider>
	);
}

export default BreadboardProvider;
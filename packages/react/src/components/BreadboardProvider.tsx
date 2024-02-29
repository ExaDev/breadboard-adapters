import { useState } from "react";
import { BreadboardProviderProps } from "../@types/types";
import { BreadboardContext } from "./breadboardContext";


const BreadboardProvider: React.FC<BreadboardProviderProps> = ({ children }) => {
	const [count, setCount] = useState(0);

	const incrementNumber = () => {
		setCount((count) => count + 1);
	}

	return (
		<BreadboardContext.Provider value={{ value: count, incrementNumber }}>
			{children}
		</BreadboardContext.Provider>
	);
}

export default BreadboardProvider;
import { useContext } from "react";
import { BreadboardContext } from "./breadboardContext";

const useBreadboard = () => {
	const context = useContext(BreadboardContext);

	if (!context) {
		throw new Error("useBreadboardContext must be used within a BreadboardProvider");
	}

	return context;
}

export default useBreadboard;
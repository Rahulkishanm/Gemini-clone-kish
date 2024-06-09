import { createContext, useState,useEffect } from "react";

import { db } from '../firebase-config'
import runChat from "../config/Gemini";

export const Context = createContext();

const ContextProvider = (props) => {
	const [promptQueuefrmExtn, setPromptQueueFrmExtnsn] = useState([])
	

	const contextValue = {
		promptQueuefrmExtn,
		setPromptQueueFrmExtnsn,
	};

	return (
		<Context.Provider value={contextValue}>{props.children}</Context.Provider>
	);
};

export default ContextProvider;

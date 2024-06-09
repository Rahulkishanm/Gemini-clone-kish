import { createContext, useState,useEffect } from "react";


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

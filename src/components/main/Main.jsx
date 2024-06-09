import { useContext,useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import GoogleButton from 'react-google-button'
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { assets } from "../../assets/assets";
import "./main.css";
import { Context } from "../../context/Context";
import { auth,db } from '../../firebase-config'
import UserProfile from '../userProfile/userProfile';
// import { signInWithPopup, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { useSignInWithGoogle,useAuthState } from 'react-firebase-hooks/auth';
import FormattedText from "../FormattedText";
import { signOut } from 'firebase/auth';
const Main = () => {
	const [user, loading, error] = useAuthState(auth);
	const [signInWithGoogle, user1, loading1, error1] = useSignInWithGoogle(auth);
	let { discussionId } = useParams();
	const [prompt,setPrompt] = useState();
	const [status, setStatus] = useState('');
	const [responses, setResponses] = useState([{ text: "I'm a chatbot powered by the Palm API Firebase Extension and built with React1.", type: 'RESPONSE' }]);
	const navigate = useNavigate();
	const {
		promptQueuefrmExtn,
		setPromptQueueFrmExtnsn,
	} = useContext(Context); 



	async function sendPrompt(event) {
		const newDiscussionId = Date.now().toString(); // Simple example for generating IDs
		navigate(`/discussions/${newDiscussionId}`);
		setPrompt(event.data);
		handlePromptSubmit({preventDefault:()=>{},discussionId:newDiscussionId,prompt:event.data})
	}
	const PROMPT_QUEUE_STATUS_FRM_EXTN = {
		NEW : 'NEW',
		DEPLOYED : 'DEPLOYED',
		FAILURE: 'FAILURE'
	}

	useEffect(() => {
		let onDataFromChromeExtension  = async (event) => {
      if (event.data.type === 'getGeminiResp') {
				console.log("we recived",event.data.text)
				setPromptQueueFrmExtnsn([...promptQueuefrmExtn,{ prompt: event.data.text, status: PROMPT_QUEUE_STATUS_FRM_EXTN.NEW}])
    }
    }
    window.addEventListener("message", onDataFromChromeExtension);
		return () => window.removeEventListener("message",onDataFromChromeExtension);

  }, []);
	useEffect(() => {
    console.log("setPromptQueueFrmExtnsn", promptQueuefrmExtn);

    const handlePromptQueue = async () => {
        if (user !== null) {
            let lastPrompt = promptQueuefrmExtn[promptQueuefrmExtn.length - 1];

            if (lastPrompt && lastPrompt.status === PROMPT_QUEUE_STATUS_FRM_EXTN.NEW) {
                lastPrompt = await createNewPageAndStartConvo(navigate,user,setPrompt,setResponses,lastPrompt,setStatus,PROMPT_QUEUE_STATUS_FRM_EXTN,setPromptQueueFrmExtnsn,promptQueuefrmExtn);

                setPromptQueueFrmExtnsn([
                    ...promptQueuefrmExtn.slice(0, promptQueuefrmExtn.length - 1),
                    lastPrompt
                ]);
            }
        }
    };

    handlePromptQueue();

}, [user, JSON.stringify(promptQueuefrmExtn)]);


	const handlePromptSubmit = async (event) => {
		console.log("user from handlePromptSubmit",user)
		let _discussionId = discussionId
		 if(discussionId===undefined && event.discussionId){
			_discussionId = event.discussionId
		 }
		const messageCollection =  collection(db, `users/${user.uid}/discussions/${_discussionId}/messages`);
		    event.preventDefault();
				let _prompt = prompt
				if(!prompt){
					_prompt = event.prompt;
				}
		    if (!_prompt) return;
		    const newPrompt = _prompt;
		    setPrompt('');
		    setResponses(responses => [...responses, { text: newPrompt, type: 'PROMPT' }]);
		
		    setStatus('sure, one sec');
		    try {
		      const discussionDoc = await addDoc(messageCollection, { prompt: newPrompt });
		      const unsubscribe = onSnapshot(discussionDoc, (doc) => {
		        const conversation = doc.data();
		        if (conversation && conversation.status) {
		          const state = conversation.status.state;
		          switch (state) {
		            case 'COMPLETED':
		              setStatus('');
		              setResponses(responses => [...responses, { text: conversation.response, type: 'RESPONSE' }]);
		              unsubscribe();
		              break;
		            case 'PROCESSING':
		              setStatus('preparing your answer...');
		              break;
		            case 'ERRORED':
		              setStatus('Oh no! Something went wrong. Please try again.');
		              unsubscribe();
		              break;
		            default:
		              break;
		          }
		        }
		      }, (err) => {
		        console.error(err);
		        setStatus('Error: ' + err.message);
		        unsubscribe();
		      });
		    } catch (err) {
		      console.error(err);
		      setStatus('Error: ' + err.message);
		    }
		  };


		const handleSignIn = async () => {
			try {
				let c = await signInWithGoogle();
				console.log("auth",c)
			} catch (error) {
				console.error(error);
			}
		};
	return (
			<div className="main">
				<div className="nav">
					<p>World's best personal assistant</p>
					<UserProfile user={user} onLogoutClicked={()=>{
							setResponses([{ text: "I'm a chatbot powered by the Palm API Firebase Extension and built with React1.", type: 'RESPONSE' }]);
						 signOut(auth).then(() => {
							console.log('logged out');
							navigate("/")
	
						}).catch((error) => {
							console.error('Error signing out: ', error);
						});
					}} />
				</div>
				<div className="main-container">
					{!discussionId ? (
						<div style={{height:'75vh', overflowY: 'auto',overscrollBehavior: 'contain'}}>
							<div className="greet">
								<p>
									<span>{`Hello, ${user ? user.displayName : "Pal"}`}</span>
								</p>
								{user ? (
									<p>{`How can I help you yesterday?`}</p>
								) : (
									<p>Please sign in to use this service.</p>
								)}
							</div>
							<div className="cards">
								{!user && <GoogleButton onClick={() => handleSignIn()} />}
							</div>
						</div>
					) : (
						<div style={{height:'75vh', overflowY: 'auto'}}>
							{responses.map((resp, index) => (
								<div key={index} className="result-data">
									{resp.type !== "PROMPT" && (
										<img
											src={assets.gemini_icon}
											alt="Chatbot Logo"
											className="chatbot-logo"
										/>
									)}
									{resp.type === "PROMPT" && (
										<img
											src={user.photoURL}
											style={{ borderRadius: "50%" }}
											alt="User Logo"
											className="chatbot-logo"
										/>
									)}
									<p>
										<FormattedText text={resp.text} />
									</p>
								</div>
							))}
							{responses[responses.length - 1].type === "PROMPT" && (
								<div className="loader">
									<hr />
									<hr />
									<hr />
								</div>
							)}
						</div>
					)}
		
					<div className="main-bottom">
						<button
							className={`clear-chat ${!user && "disbled-send-button"}`}
							onClick={() => {
								if(user){
									const _discussionId = Date.now().toString();
									navigate(`/discussions/${_discussionId}`);
									setResponses([
										{
											text: "I'm a chatbot powered by the Palm API Firebase Extension and built with React.",
											type: "RESPONSE",
										},
									]);
								}
							}}
						>
							Clear Chat
						</button>
						<div className="search-box">
							<input
							disabled={!user}
								onChange={(e) => {
									setPrompt(e.target.value);
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										// e.preventDefault(); // Prevent form submission if it's part of a form
										!discussionId
											? sendPrompt({ data: prompt })
											: handlePromptSubmit({ preventDefault: () => {} });
									}
								}}
								value={prompt}
								type="text"
								placeholder="Enter the Prompt Here"
							/>
							<div>
								<img
								  className={`${!user && "disbled-send-button"}`}
									src={assets.send_icon}
									alt=""
									onClick={() => {
										if(user){
											!discussionId
											? sendPrompt({ data: prompt })
											: handlePromptSubmit({ preventDefault: () => {} });
										}
									}}
								/>
							</div>
						</div>
						<div className="bottom-info">
							<p>
								Gemini may display inaccurate info, including about people, so
								double-check its responses.
							</p>
						</div>
					</div>
				</div>
			</div>
		);
};

export default Main;
async function createNewPageAndStartConvo(navigate, user, setPrompt, setResponses, prompt, setStatus, PROMPT_QUEUE_STATUS_FRM_EXTN, setPromptQueueFrmExtnsn, promptQueueFrmExtn) {
	const _discussionId = Date.now().toString();
	navigate(`/discussions/${_discussionId}`);
	const messageCollection = collection(db, `users/${user.uid}/discussions/${_discussionId}/messages`);
	setPrompt('');
	setResponses([{ text: prompt.prompt, type: 'PROMPT' }]);
	setStatus('sure, one sec');
	try {
		const discussionDoc = await addDoc(messageCollection, { prompt: prompt.prompt });
		const unsubscribe = onSnapshot(discussionDoc, (doc) => {
			const conversation = doc.data();
			if (conversation && conversation.status) {
				const state = conversation.status.state;
				switch (state) {
					case 'COMPLETED':
						setStatus('');
						setResponses(responses => [...responses, { text: conversation.response, type: 'RESPONSE' }]);
						prompt.status = PROMPT_QUEUE_STATUS_FRM_EXTN.DEPLOYED;
						unsubscribe();
						break;
					case 'PROCESSING':
						setStatus('preparing your answer...');
						break;
					case 'ERRORED':
						setStatus('Oh no! Something went wrong. Please try again.');
						prompt.status = PROMPT_QUEUE_STATUS_FRM_EXTN.FAILURE;
						unsubscribe();
						break;
					default:
						break;
				}
			}
		}, (err) => {
			console.error(err);
			setStatus('Error: ' + err.message);
			prompt.status = PROMPT_QUEUE_STATUS_FRM_EXTN.FAILURE;
			unsubscribe();
		});
	} catch (err) {
		console.error(err);
		setStatus('Error: ' + err.message);
		prompt.status = PROMPT_QUEUE_STATUS_FRM_EXTN.FAILURE;
	}
	return prompt
}


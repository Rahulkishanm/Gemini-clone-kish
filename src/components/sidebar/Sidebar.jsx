import "./sidebar.css";
import { assets } from "../../assets/assets";
import { useContext, useState } from "react";
import { Context } from "../../context/Context";
const Sidebar = () => {
	const [extended, setExtended] = useState(false);
	const { onSent, prevPrompts, setRecentPrompt, newChat } = useContext(Context);

	async function getDiscussionsWithFirstMessage(userId) {
		const discussionsRef = collection(db, `users/${userId}/discussions`);
		const snapshot = await getDocs(discussionsRef);
		const discussions = [];
	
		for (const doc of snapshot.docs) {
			const messagesRef = collection(db, `users/${userId}/discussions/${doc.id}/messages`);
			const messagesQuery = query(messagesRef, orderBy("createdAt", "asc"), limit(1));
			const messageSnapshot = await getDocs(messagesQuery);
	
			if (!messageSnapshot.empty) {
				const firstMessage = messageSnapshot.docs[0].data().prompt;
				discussions.push({ discussionId: doc.id, firstMessage });
			}
		}
	
		return discussions;
	}

	const loadPreviousPrompt = async (prompt) => {
		setRecentPrompt(prompt);
		await onSent(prompt);
	};
	return (
		<div className="sidebar">
			<div className="top">
				<img
					src={assets.menu_icon}
					className="menu"
					alt="menu-icon"
					onClick={() => {
						setExtended((prev) => !prev);
					}}
				/>
				<div className="new-chat">
					<img src={assets.plus_icon} alt="" onClick={()=>{
                        newChat()
                    }} />
					{extended ? <p>New Chat</p> : null}
				</div>
				{extended ? (
					<div className="recent">
						<p className="recent-title">Recent</p>
						{prevPrompts.map((item, index) => {
							return (
								<div onClick={()=>{
                                    loadPreviousPrompt(item)
                                }} className="recent-entry">
									<img src={assets.message_icon} alt="" />
									<p>{item.slice(0, 18)}...</p>
								</div>
							);
						})}
					</div>
				) : null}
			</div>
			<div className="bottom">
				<div className="bottom-item recent-entry">
					<img src={assets.question_icon} alt="" />
					{extended ? <p>Help</p> : null}
				</div>
				<div className="bottom-item recent-entry">
					<img src={assets.history_icon} alt="" />
					{extended ? <p>Activity</p> : null}
				</div>
				<div className="bottom-item recent-entry">
					<img src={assets.setting_icon} alt="" />
					{extended ? <p>Settings</p> : null}
				</div>
			</div>
		</div>
	);
};

export default Sidebar;

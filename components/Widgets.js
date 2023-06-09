import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import FiberManualRecordRoundedIcon from "@mui/icons-material/FiberManualRecordRounded";
import Image from "next/image";
import TimeAgo from "timeago-react";
import { useSelector } from "react-redux";

import { useEffect, useState } from "react";
import ImageGrid from "./ImageContainer/ImageGrid";

function Widgets(props) {
	const { fetchUserMemes, userMemes, fromProfile } = props;
	const [user, setUser] = useState(null);

	useEffect(() => {
		const user = JSON.parse(localStorage.getItem("user"));
		if (user) {
			setUser(user);
		}
	}, []);
	

	return (
		<div className='inline space-y-2 overflow-y-auto overflow-x-hidden scrollbar-hide'>
			{/* News */}
			{!fromProfile && (
				<div className='bg-white dark:bg-slate-800 py-2.5 rounded-lg space-y-2 w-full overflow-hidden border border-gray-300 dark:border-none'>
					<div className='items-center justify-between font-bold px-2.5 flex'>
						<h4>Memeo News</h4>
						<InfoRoundedIcon className='h-5 w-5' />
					</div>
					<div className='space-y-1'></div>
				</div>
			)}
			{/* Ads */}
			{!fromProfile && (
				<div className='bg-white dark:bg-slate-800 py-2.5 rounded-lg space-y-2 w-full overflow-hidden border border-gray-300 dark:border-none'>
					<div className='items-center justify-between font-bold px-2.5 flex'>
						<h4>Ads</h4>
						<InfoRoundedIcon className='h-5 w-5' />
					</div>
				</div>
			)}
			{/* ImagesGrid */}
			{fromProfile && (
				<div
					className='bg-white dark:bg-slate-800 py-2.5 rounded-lg space-y-2 w-full border border-gray-300 dark:border-none  overflow-y-auto scrollbar-hide relative'
					style={{
						height: "520px",
					}}>
					<div className='items-center justify-between font-bold px-2.5 flex sticky top-0 z-40'>
						<h4>Template</h4>
						{/* <InfoRoundedIcon className='h-5 w-5' /> */}
					</div>
					<ImageGrid fetchUserMemes={fetchUserMemes} userMemes={userMemes} />
				</div>
			)}
		</div>
	);
}

export default Widgets;

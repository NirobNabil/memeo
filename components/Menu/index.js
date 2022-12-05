import React from "react";
import Submenu from "../Submenu";

const Menu = (props) => {
	const {
		profile,
		following,
		followers,
		follow,
		followingUIDs,
		followersUIDs,
		fetchFollowing,
		fetchFollow,
		fetchFollowers,
		active,
		fromFavorites,
		page,
	} = props;

	return (
		<div
			className={`bg-white  dark:bg-slate-800 dark:text-gray-300 border-1 dark:border-white border-solid  rounded-lg flex flex-col space-y-4 p-4  w-64 z-10 sticky shadow-md ${
				page === "favorites" ? "top-0" : "top-20"
			}`}>
			<Submenu
				following={following}
				follow={follow}
				followers={followers}
				followingUIDs={followingUIDs}
				followersUIDs={followersUIDs}
				profile={profile}
				fetchFollowing={fetchFollowing}
				fetchFollow={fetchFollow}
				fetchFollowers={fetchFollowers}
				active={active}
				fromFavorites={fromFavorites}
			/>
		</div>
	);
};

export default Menu;

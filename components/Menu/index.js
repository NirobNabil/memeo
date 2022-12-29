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
		modalFollowOpen,
		setModalFollowOpen,
		modalFollowingOpen,
		setModalFollowingOpen,
		modalFollowersOpen,
		setModalFollowersOpen,
		followListRemove,
		setFollowListRemove,
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
				modalFollowOpen={modalFollowOpen}
				setModalFollowOpen={setModalFollowOpen}
				modalFollowingOpen={modalFollowingOpen}
				setModalFollowingOpen={setModalFollowingOpen}
				modalFollowersOpen={modalFollowersOpen}
				setModalFollowersOpen={setModalFollowersOpen}
				followListRemove={followListRemove}
				setFollowListRemove={setFollowListRemove}
				
			/>
		</div>
	);
};

export default Menu;

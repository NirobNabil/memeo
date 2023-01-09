import Link from "next/link";
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
			className={`z-10 sticky ${
				page === "favorites" ? "top-0" : "top-20"
			} flex flex-col gap-10`}>
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

			{/* terms and condition and copyright */}
			<div className='flex flex-col gap-4'>
				<div className='terms text-sm text-white/50 flex gap-4 items-center'>
					<Link href='/privacy-policy'>
						<a className='text-gray-700 dark:text-white/50 hover:text-orange-red transition'>
							Privacy Policy
						</a>
					</Link>
					<div className='dot w-1 h-1 rounded-full bg-gray-700 dark:bg-white/50'></div>
					<Link href='/termsandcondition'>
						<a className='text-gray-700 dark:text-white/50 hover:text-orange-red transition'>
							Terms & Conditions
						</a>
					</Link>
				</div>
				{/* copyright  */}
				<div>
					<p className='text-gray-700 dark:text-white/50 text-sm'>
						All rights reserved by memoapp &copy; 2023
					</p>
				</div>
			</div>
		</div>
	);
};

export default Menu;

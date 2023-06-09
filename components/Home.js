import Feed from "./Feed";
import Widgets from "./Widgets";
import Menu from "./Menu";
import Link from "next/link";

export default function Home(props) {
	const {
		posts,
		active,
		inactive,
		follow,
		following,
		followers,
		followingUIDs,
		followersUIDs,
		fetchMore,
		fetchFollowing,
		fetchFollow,
		fetchFollowers,
		fetchUserMemes,
		userMemes,
		Isactive,
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
		<>
			<div className=' bg-[#F3F2EF] dark:bg-slate-900 dark:text-white min-h-screen flex  flex-row w-full mx-auto  justify-center '>
				<div className='hidden sm:flex flex-col gap-8 items-center md:items-start md:w-[360px] px-2 min-h-max h-screen sticky top-[105px]'>
					<Menu
						following={following}
						follow={follow}
						followers={followers}
						followingUIDs={followingUIDs}
						followersUIDs={followersUIDs}
						fetchFollowing={fetchFollowing}
						fetchFollow={fetchFollow}
						fetchFollowers={fetchFollowers}
						active={Isactive}
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
				<div className='border-l border-r border-gray-400 dark:border-gray-700 max-w-xl w-full md:w-[520px] space-x-5 my-[17px] mx-3 md:mx-0'>
					<Feed
						posts={posts}
						inactive={inactive}
						len={1}
						active={active}
						fetchMore={fetchMore}
					/>
				</div>
				<div className='hidden sm:inline item-center px-6 xl:items-end xl:w-[360px] min-h-max h-screen sticky top-[105px]'>
					<Widgets fetchUserMemes={fetchUserMemes} userMemes={userMemes} />
				</div>
			</div>
		</>
	);
}

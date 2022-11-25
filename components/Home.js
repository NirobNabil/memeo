import Feed from "./Feed";
import Widgets from "./Widgets";
import Menu from "./Menu";


export default function Home(props) {
    const { posts, active, inactive, follow, following, followers, followingUIDs, followersUIDs, fetchMore, fetchFollowing, fetchFollow, fetchFollowers, fetchUserMemes, userMemes, Isactive } = props

    return (
        <>
        <div className="bg-[#F3F2EF] dark:bg-slate-900 dark:text-white min-h-screen flex  flex-row w-full mx-auto md:space-y-6 justify-center ">
            <div className="hidden md:flex xl:flex flex-col items-center xl:items-start xl:w-[360px] p-2">
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
                />
            </div>
            <div  className="flex-grow border-l border-r border-gray-100 dark:border-gray-700 max-w-xl xl:w-[520px]  space-x-5  my-3 mx-3 md:mx-0">
              <Feed 
                posts={posts}   
                inactive={inactive} 
                len={1} 
                active={active} 
                fetchMore={fetchMore}
                />
            </div>
            <div className="hidden  md:inline space-y-5 p-2 item-center px-6 xl:items-end  xl:w-[360px]">
                <Widgets 
                 fetchUserMemes={fetchUserMemes}
                 userMemes={userMemes}
                />
            </div>
        </div>
        </>
    )
}


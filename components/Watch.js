import React from "react";
import Home from './Home'


const Component = (props) => {
    
    const { 
        videoPosts,
        active,
        following,
        follow, 
        followers, 
        followingUIDs, 
        followersUIDs, 
        fetchMore, 
        fetchFollow, 
        fetchFollowers, 
        fetchFollowing, 
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
    } = props

    return (
            <Home 
            posts={videoPosts}
            inactive={true}
            active={active}
            following={following}
            follow={follow}
            followers={followers}
            followingUIDs={followingUIDs}
            followersUIDs={followersUIDs}
            fetchMore={fetchMore}
            fetchFollowing={fetchFollowing}
            fetchFollow={fetchFollow}
            fetchFollowers={fetchFollowers}
            fetchUserMemes={fetchUserMemes}
            userMemes={userMemes}
            Isactive={Isactive}
            modalFollowOpen={modalFollowOpen}
            setModalFollowOpen={setModalFollowOpen}
            modalFollowingOpen={modalFollowingOpen}
            setModalFollowingOpen={setModalFollowingOpen}
            modalFollowersOpen={modalFollowersOpen}
            setModalFollowersOpen={setModalFollowersOpen}
            followListRemove={followListRemove}
            setFollowListRemove={setFollowListRemove}
        />
    )
}



export default Component

import React from "react";
import Home from './Home'


const Component = (props) => {
    
    const { videoPosts, active,  following, follow, followers, followingUIDs, followersUIDs, fetchMore, fetchFollow, fetchFollowers, fetchFollowing, fetchUserMemes, userMemes, Isactive } = props

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
        />
    )
}



export default Component

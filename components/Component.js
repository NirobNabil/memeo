import React from "react";
import Home from './Home'


const Component = (props) => {
    const { posts, active, follow, following, followers, followingUIDs, followersUIDs, fetchMore, fetchFollow, fetchFollowers, fetchFollowing, userMemes,  fetchUserMemes } = props

   
    return (
         <Home 
            posts={posts}
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
           />
    )
}

export default Component
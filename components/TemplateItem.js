import React, { useState} from 'react'
import Trending from './Template/Trending'

import TemplateSekeleton from './Skeleton/TemplateSekeleton'
import InfiniteScroll from 'react-infinite-scroll-component'


export default function TemplateItem({ memes, fetchMoreMemes, loading, from}) {
	const [hasMore, setHasMore] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)

  return (
          <InfiniteScroll
						dataLength={memes.length}
						next={fetchMoreMemes}
						hasMore={hasMore}
						loader={() => {
							setLoadingMore(true)
							setTimeout(() => {
								setLoadingMore(false)
							}, 10000)
							return (
								<div className="flex justify-center items-center">
									{loadingMore && <TemplateSekeleton />}
								</div>
							)
						}}
						endMessage={
							<p style={{ textAlign: "center" }}>
								<b>Yay! You have seen it all</b>
							</p>
						}
						
					> 
					<div className='meme-templates'>
						<div style={{ display: "grid" }} className='grid-cols-3 gap-8'>
							{memes?.map((template) => 
			                 <Trending key={template.id} data={template} />)}
						      {loading && <TemplateSekeleton  from={from} />}
						</div>
					 </div>
			</InfiniteScroll>
  )
}

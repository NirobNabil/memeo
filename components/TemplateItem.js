import React from 'react'
import Trending from './Template/Trending'

import TemplateSekeleton from './Skeleton/TemplateSekeleton'
import InfiniteScroll from 'react-infinite-scroll-component'


export default function TemplateItem({ memes, fetchMoreMemes, loading, from}) {
  return (
          <InfiniteScroll
						dataLength={memes.length}
						next={fetchMoreMemes}
						hasMore={true}
						loader={
							<div className='flex justify-center items-center'>
								<span className='text-sm'>Loading...</span>
							</div>
				     	}
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
						  {loading && [1, 2, 3, 4].map((item) =>  <TemplateSekeleton key={item} from={from} />)}
						</div>
					 </div>
			</InfiniteScroll>
  )
}

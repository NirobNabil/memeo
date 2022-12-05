import React, { useState, useEffect } from "react";
import Trending from "./Template/Trending";

import TemplateSekeleton from "./Skeleton/TemplateSekeleton";
import InfiniteScroll from "react-infinite-scroll-component";

export default function TemplateItem({
	memes,
	fetchMoreMemes,
	loading,
	from,
	setMyMemes,
}) {
	const [hasMore, setHasMore] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);

	useEffect(() => {
		console.log(memes);
	}, [memes]);

	return (
		<InfiniteScroll
			dataLength={memes.length}
			next={fetchMoreMemes}
			hasMore={hasMore}
			loader={() => {
				setLoadingMore(true);
				setTimeout(() => {
					setLoadingMore(false);
				}, 10000);
				return (
					<div className='flex justify-center items-center'>
						{loadingMore && <TemplateSekeleton />}
					</div>
				);
			}}
			endMessage={
				<p style={{ textAlign: "center" }}>
					<b>Yay! You have seen it all</b>
				</p>
			}>
			<div className='meme-templates'>
				<div style={{ display: "grid" }} className='grid-cols-3 gap-8'>
					{memes?.map((template) => (
						<Trending
							key={template.id}
							data={template}
							owner={from === "meme-generator" ? true : false}
							setMyMemes={setMyMemes}
						/>
					))}
					{loading && <TemplateSekeleton from={from} />}
					{memes?.length === 0 && (
						<div className='py-10 font-bold text-gray-400 text-center text-2xl col-span-3'>
							<p>Please upload at least one</p>
						</div>
					)}
				</div>
			</div>
		</InfiniteScroll>
	);
}

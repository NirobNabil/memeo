import React, { useState, useEffect } from "react";
import Trending from "./Template/Trending";

import TemplateSekeleton from "./Skeleton/TemplateSekeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import AlertBox from "./Components/AlertBox";

export default function TemplateItem({
	memes,
	fetchMoreMemes,
	loading,
	from,
	setMyMemes,
	activeTab,
}) {
	const [hasMore, setHasMore] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [isDeleted, setIsDeleted] = useState(false);

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
							setIsDeleted={setIsDeleted}
						/>
					))}
					{loading && <TemplateSekeleton from={from} />}
					{!loading && memes?.length === 0 && (
						<div className='py-10 font-bold text-gray-400 text-center text-2xl col-span-3'>
							{activeTab === "meme-generator" ? (
								<p>Please upload at least one</p>
							) : (
								<p>No memes found!!!</p>
							)}
						</div>
					)}
				</div>
			</div>
			<AlertBox
				show={isDeleted}
				text='Go to trash Successfully!'
				severity='success'
				setShow={setIsDeleted}
			/>
		</InfiniteScroll>
	);
}

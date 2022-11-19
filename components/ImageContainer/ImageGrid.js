/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
import React, { useState } from "react";
import GridList from "@material-ui/core/GridList";
import { ImageList } from "@material-ui/core";
import ImageListItem from "@material-ui/core/ImageListItem";
import ImageListItemBar from "@material-ui/core/ImageListItemBar";

import Grid from "@material-ui/core/Grid";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import IconButton from "@material-ui/core/IconButton";
import InfoIcon from "@material-ui/icons/Info";
import SaveIcon from "@material-ui/icons/SaveAlt";
import Dialog from "@material-ui/core/Dialog";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import LinearProgress from "@material-ui/core/LinearProgress";
import ListSubheader from '@material-ui/core/ListSubheader';
import InfiniteScroll from "react-infinite-scroll-component";




export default function ImageGrid(props) {
 

  const { fetchUserMemes, userMemes } = props;

    const [open, setOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [error, setError] = useState(null);

   

    const handleOpen = (img) => {
        setSelectedImage(img);
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleSave = (URL) => {
        const downloadUrl = URL;
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.target = '_blank';
        a.download = 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    return (
        <>
            <InfiniteScroll
                dataLength={userMemes.length}
                next={fetchUserMemes}
                hasMore={hasMore}
                loader={<LinearProgress />}
                endMessage={
                    <p style={{ textAlign: "center" }}>
                        <b>Yay! You have seen it all</b>
                    </p>
                }
                height={500}
                scrollableTarget="scrollableDiv"

            >
                <ImageList rowHeight={160} cols={3}
                 style={{
                    scrollBehavior: "smooth",
                    overflowY: "scroll",
                    overflowX: "hidden",
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-around",
                    overflow: "hidden",
                    padding: "0px 0px 0px 0px",
                    margin: "0px 0px 0px 0px",
                    }}

                >
                    {userMemes.map((img) => (
                        <ImageListItem key={img.id}>
                            {img?.type === "image" ? (
                            <img 
                            src={img.memeURL} alt={img?.name}
                            onClick={() => handleOpen(img)}
                            className="cursor-pointer object-cover w-full h-full"
                            />
                            ) : (
                            <video
                            src={img.memeURL}
                            onClick={() => handleOpen(img)}
                            className="cursor-pointer object-cover w-full h-full"
                            autoPlay
                            loop
                            muted
                            />
                            )}
                            <ImageListItemBar
                                title={img.name}
                                actionIcon={
                                    <IconButton onClick={() => handleSave(img.memeURL)}>
                                        <SaveIcon />
                                    </IconButton>
                                }
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
            </InfiniteScroll>
            
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <CloseIcon className="close" onClick={handleClose} />
                {selectedImage?.type === "image" ? (
                <img src={selectedImage.memeURL} alt="" className="dialogImage" />
                ) : (
                <video
                    src={selectedImage?.memeURL}
                    className="dialogImage"
                    autoPlay
                    loop
                    muted
                    controls
                />
                )}
            </Dialog>
            {loading && <LinearProgress />}
            {error && <Typography variant="h6" color="error">{error}</Typography>}
        </>
    )
}

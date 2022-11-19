import React, { useEffect, Suspense } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchUser, clearData } from "../redux/actions/index";
import Component from './Component';
import Loading from "./Loading";

import { auth } from '../firebase';


function LazyConnect(props){
    
    useEffect(() => {
        auth.onAuthStateChanged(user => {
            if(user){
                props.fetchUser(user);
            }else{
                props.clearData();
            }
        })
    }, [])

    return (
        <Suspense fallback={<Loading loading={true} />}>
            <Component {...props} />
        </Suspense>
    )
}

const mapStateToProps = (store) => {
    return {
      data: store.data
    }
}
  
const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchUser, clearData}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(LazyConnect);
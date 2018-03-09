var AppManager = (function () {
    function AppManager() {
        this.logEvent("Starting application. AppManager 0.4.0");
    }
    
    AppManager.prototype.fnPollingMonitor = function() {
        var cti = window.cti;
        // Fetchs the array index of a job from the jobList
        function findSummaryEntry(jobid) {
            for (var k in cti.store.jobs.jobList) {
                var thisJob = cti.store.jobs.jobList[k];
                if (thisJob.aAccuServJobID.iJobEventNoKey == jobid) {
                    return k;
                }
            }
            return undefined;
        }
        
        // Fetchs the array index of a job from the jobDetail
        function findDetailEntry(jobid) {
            for (var k in cti.store.jobs.jobDetails) {
                var thisJob = cti.store.jobs.jobDetails[k];
                if (thisJob.aAccuServJobID.iJobEventNoKey == jobid) {
                    return k;
                }
            }
            return undefined;
        }
        
        // Polling Checks for data once logged into the app successfully
        if(cti.store.currentProfile) {
            // Re-sync Job List
            if(cti.store.state.currentPage === "JobList") {
                if(cti.store.variables.reSyncJobList) {
                    cti.utils.callAction('call-actionflow', { "name": "GetJobList" });
                }
            }
            
            /* if(cti.store.variables.jobListAutoRefresh === undefined) cti.store.variables.jobListAutoRefresh = 6;
            
            if(cti.store.variables.jobListAutoRefresh > 0) {
            cti.store.variables.jobListAutoRefresh--;
            } else {
            cti.store.variables.jobListAutoRefresh = undefined;
            cti.store.variables.reSyncJobListAuto = true;
            cti.utils.callAction('call-actionflow', { "name": "GetJobList" });
            } */
            
            // Check for jobs in which we need a full job detail struct for
            // Purge any detail records for which there isn't a summary
            for (var k in cti.store.jobs.jobDetails) {
                var thisJob = cti.store.jobs.jobDetails[k];
                var summaryIndex = findSummaryEntry(thisJob.aAccuServJobID.iJobEventNoKey);
                if (summaryIndex === undefined) {
                    cti.store.jobs.jobDetails.splice(k, 1);
                }
            }
            
            cti.store.variables.jobDetailToFetch = undefined;
            
            if(cti.store.variables.pendingJobDetailToFetch === undefined) {
                cti.store.variables.pendingJobDetailToFetch = {
                    "iJobEventNoKey" : 0
                };
            }
            
            // Locate the next summary we don't have detail for
            for (var k in cti.store.jobs.jobList) {
                var thisJob = cti.store.jobs.jobList[k];
                var detailIndex = findDetailEntry(thisJob.aAccuServJobID.iJobEventNoKey);
                if (detailIndex === undefined) {
                    cti.store.variables.jobDetailToFetch = {
                        "iJobEventNoKey" : thisJob.aAccuServJobID.iJobEventNoKey
                    };
                    break;
                }
            }
            
            // If we haven't run out of retries, fetch the job detail if we have a valid ID
            if(cti.store.jobs.retrieveJobRetry > 0) {
                if(cti.store.variables.jobDetailToFetch !== undefined) {
                    if(cti.store.variables.jobDetailToFetch.iJobEventNoKey !== cti.store.variables.pendingJobDetailToFetch.iJobEventNoKey) {
                        cti.utils.callAction('call-actionflow', { "name": "GetJobDetailOffline" });
                    }
                }
            }
            
            if(cti.store.jobs.jobList != undefined) {
                if(cti.store.jobs.jobList.length > 0) {
                    // Checks for any staticData lists that haven't returned data
                    var dataRequired = false;
                    if(cti.store.staticData.abandonJobList === undefined) {
                        dataRequired = true;
                    } else if(cti.store.staticData.noAccessList === undefined) {
                        dataRequired = true;
                    } else if(cti.store.staticData.tradesList === undefined) {
                        dataRequired = true;
                    } else if(cti.store.staticData.stockSuppliers === undefined) {
                        cti.store.staticData.updateStatus.updateSupplier = true;
                        dataRequired = true;
                    }
            
                    if(dataRequired) {
                        cti.utils.callAction('call-actionflow', { "name": "StaticData" });
                    }
                }
            }
        
            if(cti.store.state.currentPage === "JobList") {
                // Check and attempt to re-submit any failed jobs
                if(cti.store.jobs.failedJobs != undefined) {
                    if(cti.store.jobs.failedJobs.length > 0) {
                        cti.store.jobs.failedJobToSend = cti.store.jobs.failedJobs[0];
                        cti.utils.callAction('call-actionflow', { "name": "JobCompleteOffline" });
                    }
                }
            
                // Check and attempt to re-submit any failed photos
                if(cti.store.jobs.failedPhotos != undefined) {
                    if(cti.store.jobs.failedPhotos.length > 0) {
                        cti.store.jobs.failedPhotosToSend = cti.store.jobs.failedPhotos[0];
                        cti.utils.callAction('call-actionflow', { "name": "SubmitPhotosOffline" });
                    }
                }  
            }
        }
    }

    AppManager.prototype.fnAuthCheckMonitor = function () {
        var cti = window.cti;

        var now = new Date();
        var onLoginPage = false;
        
        // This function is run every 2 seconds to check the auth status of the user
        if (cti.store.state !== undefined && cti.store.state.currentPage !== undefined) {
            var currentPage = cti.store.state.currentPage;
            onLoginPage = (currentPage == "Login" || currentPage == "AppSettings");
            // We only need to check things further if we aren't at the login page
            if (!onLoginPage) {
                var tokenExpiry = undefined;
                if (cti.store.currentProfile !== undefined) {
                    tokenExpiry = cti.store.currentProfile.expiryTime;
                    if (typeof tokenExpiry === "string") {
                        tokenExpiry = new Date(tokenExpiry);
                        cti.store.currentProfile.expiryTime = tokenExpiry;
                    }
                }
                if (tokenExpiry !== undefined && tokenExpiry > now) {
                    // We appear to be legitimately logged in. Nothing to see here!
                }
                else {
                    var lastTokenStatus = (tokenExpiry === undefined) ? '(no token present)' : ('(expired at ' + window.accuServFunctions.fnLocaleTimeString(tokenExpiry) + ')');
                    window.appManager.logEvent('Attempt to access restricted area whilst not logged in, or the login session has just expired ' + lastTokenStatus, 'warning');
                    // Clear down and kick out
                    window.accuServFunctions.fnTimedOutLogout();
                    return false;
                }
            }
        }

        if (cti.store.currentProfile !== undefined && cti.store.currentProfile.tokenAutoRefreshDue !== undefined && cti.store.currentProfile.refreshingToken == false) {
            var refreshDue = (typeof cti.store.currentProfile.tokenAutoRefreshDue === "string") ? new Date(cti.store.currentProfile.tokenAutoRefreshDue) : cti.store.currentProfile.tokenAutoRefreshDue;

            // If we've ticked over the point where we need to look to fetch a new token, kick off that now
            if (refreshDue < now && !onLoginPage) {
                cti.utils.callAction('call-actionflow', { "name": "RefreshToken" });
            }
        }        
    }

    AppManager.prototype.pollingMonitor = function() {
        
        function runPollingMonitorFunction() {
            window.appManager.fnPollingMonitor();
        }

        function runAuthCheckMonitor() {
            window.appManager.fnAuthCheckMonitor();
        }

        //var monitorInterval = parseInt(getMetadataValue('MonitorInterval', 10000), 10000);
        var monitorInterval = 10000;

        runPollingMonitorFunction();
        setInterval(function () {
            runPollingMonitorFunction();
        }, monitorInterval);

        runAuthCheckMonitor();
        setInterval(function () {
            runAuthCheckMonitor();
        }, 2000);
    }
	
	// Log an event to console and append to the event log buffer, which can be displayed to in the UI if required
	//   message : Message text t be logged
	//   category : Message category. Free text, but suggest - debug | info | warning | error
	AppManager.prototype.logEvent = function (message, category) {
        var t = this.dateTimeDisplayStr();
        var c = (category || 'debug');
		var entry = c + (":: " + t + "  " + message);
		console.log(entry);
		var store = this.getCti(true);
		if (!store) { returns; }
		if (store.log == undefined) { store.log = []; }
		store.log.splice(0, 0, { "time": t, "type": c, "message": message });
		var l = store.log.length;
		var m = 200;
		if (l > m) {
		    store.log.splice(m, l-m);
		}
    }

    // Log an event to console and append to the event log buffer, which can be displayed to in the UI if required
    //   message : Message text t be logged
    //   errObjectOrString : err object - designed to deal with error processing from a callback function
    //   category : Message category. Free text, but suggest - debug | info | warning | error
    AppManager.prototype.logError = function (message, errObjectOrString, category) {
        var error = (typeof errObjectOrString === "object") ? JSON.stringify(errObjectOrString) : errObjectOrString;
        var logMessage = message;
        if (logMessage === undefined || logMessage == '') {
            logMessage = error || '(undefined error)';
        }
        else if (error !== undefined && error != '') {
            logMessage += ('; ' + error);
        }
        this.logEvent(logMessage, (category || 'error'));
    }

    AppManager.prototype.uploadFileAndAssociateWithJob = function (serverBaseUri, uploadEndpoint, associateEndpoint, photoObject, jobObject, callback) {
        var instance = this;
        function uploadFileCallback(r) {
            // If photo uploaded successfully...
            /*
            resp = {
                errorCode: 0,
                errorDesc: "Image posted OK",
                imageFile: "image.jpg",
                imageDir: "cj",
                messageid: "Mike's Message"
            }
            */
            if (!r.result) {
                callback(false);
                return false;
            }

            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        instance.logEvent("Photo associated with job", "info");
                        callback(true);
                    }
                    else {
                        callback(false);
                    }
                }
            };
            xhttp.open("POST", serverBaseUri + associateEndpoint, true);
            xhttp.setRequestHeader("content-type", "application/json");
            var headers = instance.newHeaderData();
            for (var k in headers) {
                xhttp.setRequestHeader(k, headers[k]);
            }
            
            if(photoObject.category === 'Ad Hoc') {
                photoObject.docDescription = 'Ad Hoc Photograph';
            } else if(photoObject.category === 'Pre Work') {
                photoObject.docDescription = 'Pre Work Photograph';
            } else if(photoObject.category === 'Post Work') {
                photoObject.docDescription = 'Post Work Photograph';
            }

            var payload = {
                "data": {
                    "imageName": r.imageFile,
                    "path": r.imageDir,
                    "jobNo": jobObject.aAccuServJobID.sJobNo,
                    "eventNo": jobObject.aAccuServJobID.iEventNo,
                    "propertyKeyNo": jobObject.aPropertyDetail.sPropertyID,
                    "docType": "Photo",
                    "docSubType": photoObject.category,
                    "description": photoObject.docDescription,
                    "docNote": photoObject.description
                }
            }
            console.log("debug:: Associate photo: " + JSON.stringify(payload));
            xhttp.send(JSON.stringify(payload));
        }

        instance.uploadFile(serverBaseUri + uploadEndpoint, photoObject.src, uploadFileCallback);
        /* uploadFileAndAssociateWithJob end */
    }

    AppManager.prototype.uploadBase64AndAssociateWithJob = function (serverBaseUri, uploadEndpoint, associateEndpoint, sourceObject, jobObject, imageType, callback) {
        var instance = this;

        function base64UploadedCallback(r) {
            if (r !== undefined && typeof r == "string") {
                r = JSON.parse(r);
            }

            // Base64 upload endpoint gives a different response
            if (r.errorCode === undefined || r.errorCode != 0) {
                callback(false);
                return false;
            }

            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        //console.log(JSON.stringify(xhttp.response));
                        instance.logEvent("Photo (base64) associated with job", "info");
                        callback(true);
                    }
                    else {
                        callback(false);
                    }
                }
            };
            xhttp.open("POST", serverBaseUri + associateEndpoint, true);
            xhttp.setRequestHeader("Content-Type", "application/json");
            var headers = instance.newHeaderData();
            for (var k in headers) {
                xhttp.setRequestHeader(k, headers[k]);
            }

            if(sourceObject.category == 'Ad Hoc') {
                sourceObject.docDescription = 'Ad Hoc Photograph';
            } else if(sourceObject.category == 'Pre Work') {
                sourceObject.docDescription = 'Pre Work Photograph';
            } else if(sourceObject.category == 'Post Work') {
                sourceObject.docDescription = 'Post Work Photograph';
            } else if(sourceObject.category == 'No Access') {
                sourceObject.docDescription = 'No Access Photograph';
            }

            if(sourceObject.docSubType == 'Operative job completion') {
                sourceObject.docDescription = 'Operative has signed off completion of this job.';
            } else if(sourceObject.docSubType == 'Risk assessment sign-off') {
                sourceObject.docDescription = 'Risk assessment has been signed off by the operative';
            } else if(sourceObject.docSubType == 'Tenant sign-off') {
                sourceObject.docDescription = 'Tenat has singed off this job.';
            }

            var payload = {
                "data": {
                    "imageName": r.imageFile,
                    "path": r.imageDir,
                    "jobNo": jobObject.aAccuServJobID.sJobNo,
                    "eventNo": jobObject.aAccuServJobID.iEventNo,
                    "propertyKeyNo": jobObject.aPropertyDetail.sPropertyID,
                    "docType": sourceObject.docType || "Photo",
                    "docSubType": sourceObject.category || sourceObject.docSubType,
                    "description": sourceObject.docDescription,
                    "docNote": sourceObject.description || sourceObject.docNote
                }
            }
            console.log("debug:: Associate " + payload.data.docType + ": " + JSON.stringify(payload));
            xhttp.send(JSON.stringify(payload));
        }

        var xhttp2 = new XMLHttpRequest();
        xhttp2.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    base64UploadedCallback(xhttp2.response);
                    // Action to be performed when the document is read;
                    instance.logEvent("Upload base64 data successful", "info");
                }
                else {
                    callback(false);
                }
            }
        };
        xhttp2.open("POST", serverBaseUri + uploadEndpoint, true);
        xhttp2.setRequestHeader("Content-Transfer-Encoding", "base64");
        var headers = instance.newHeaderData();
        for (var k in headers) {
            xhttp2.setRequestHeader(k, headers[k]);
        }
        if(imageType == "photo") {
            xhttp2.setRequestHeader("Content-Type", "image/jpeg");
            sourceObject.content = sourceObject.content.replace('data:image/jpeg;base64,', '');
        } else {
            xhttp2.setRequestHeader("Content-Type", "image/png");
            sourceObject.content = sourceObject.content.replace('data:image/png;base64,', '');
        }
        instance.logEvent("Uploading base64 content, length = " + sourceObject.content.length);
        xhttp2.send(sourceObject.content);
        /* uploadBase64AndAssociateWithJob end */
    }

    AppManager.prototype.uploadFile = function (serverUri, fileURL, callback) {
        var instance = this;
        var callbackResponseObject = { "result": false };

        /*
        Example success response:

        {
            "bytesSent":16882,
            "responseCode":200,
            "response": "{
                \"errorCode\":0,
                \"errorDesc\":\"Image posted OK\",
                \"imageFile\":\"E1F7BF41-D684-448B-82CC-BFF331958261.jpg\",
                \"imageDir\":\"E1F7BF41-D684-448B-82CC-BFF331958261.jpg\",
                \"messageid\":\"b1dda35d-9995-4bbe-875f-75b10baa5aba\"
            }",
            "objectId":"" }
        */

        function win(r) {
            callbackResponseObject = { result: false, errorDesc: "An unexpected error occurred", errorCode: -1 }
            if (r !== undefined && r.response !== undefined) {
                callbackResponseObject = (typeof r.response == 'object') ? r.response : JSON.parse(r.response);
            }
            if (r.responseCode == 200 || (r !== undefined && r.errorCode == 0)) {
                callbackResponseObject.result = true;
                instance.logError("uploadFile complete", r, "info");
            }
            else {
                var error = (r !== undefined && r.errorDesc !== undefined) ? r.errorDesc : "An unknown error occured.";
                callbackResponseObject.error = error;
                instance.logError("uploadFile unsuccessful: " + error, r);
            }
            callback(callbackResponseObject);
        }

        function fail(error) {
            callbackResponseObject.error = error;
            instance.logError("Error during uploadFile", error);
            callback(callbackResponseObject);
        }

        instance.logEvent("Upload file " + fileURL + " to " + serverUri);
        var uri = encodeURI(serverUri);

        try {
            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
            options.mimeType = "image/jpeg";
            options.chunkedMode = false;
            //options.mimeType = "text/plain";
            options.headers = instance.newHeaderData();
            options.headers["Content-Type"] = "image/jpeg";

            var ft = new FileTransfer();
            ft.onprogress = function (progressEvent) {
            };
            ft.upload(fileURL, uri, win, fail, options);
        }
        catch (e) {
            instance.logError("Exception in uploadFile", e);
            callbackResponseObject.error = e;
            callback(callbackResponseObject);
        }
    }

    AppManager.prototype.uploadFileAsBase64 = function (serverUri, fileURL, callback) {
        var instance = this;

        function fail(error) {
            instance.logError("Error during uploadFile", error);
            callback(false);
        }

        function gotFile(fileEntry) {
            fileEntry.file(function (file) {
                var reader = new FileReader();
                reader.onloadend = function (e) {
                    sendContent(this.result);
                };
                reader.readAsDataURL(file);
            });
        }

        function sendContent(content) {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        // Action to be performed when the document is read;
                        instance.logEvent("Upload base64 data successful", "info");
                        callback(true);
                    }
                    else {
                        callback(false);
                    }
                }
            };
            xhttp.open("POST", uri, true);
            xhttp.setRequestHeader("content-type", "text/plain");
            xhttp.setRequestHeader("Content-Transfer-Encoding", "base64");
            var headers = instance.newHeaderData();
            for (var k in headers) {
                xhttp.setRequestHeader(k, headers[k]);
            }
            instance.logEvent("Uploading base64 content, length = " + content.length);
            xhttp.send(content);
        }

        instance.logEvent("Upload file as base64 " + fileURL + " to " + serverUri);
        var uri = encodeURI(serverUri);
        window.resolveLocalFileSystemURL(fileURL, gotFile, fail);
    }

    // Helper function to compare if two dates are the same (ignoring time)
    AppManager.prototype.areDatesEqual = function (date1, date2) {
        var d1 = (typeof date1 === "string") ? new Date(date1) : date1;
        var d2 = (typeof date2 === "string") ? new Date(date2) : date2;
        return (d1 !== undefined && d2 !== undefined && d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate());
    }

	// Gets a display friendly date time - for logging etc
	AppManager.prototype.dateTimeDisplayStr = function() {
		var d = new Date();
		var min = d.getMinutes();
		var sec = d.getSeconds();
		if (min < 10) {
			min = "0" + min;
		}
		if (sec < 10) {
			sec = "0" + sec;
		}
		var dateStr = d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();  
		return dateStr + ' ' + (d.getHours() + ':' + min + ':' + sec + '.' + d.getMilliseconds());
	}
	
	// Create a new guid. Obs.
	AppManager.prototype.newGuid = function() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	  });  		
	}
	
	// Initialise an object with all of the default stuff we need in the API headers for every call
	AppManager.prototype.newHeaderData = function () {
		var details = {
			"messageid": this.newGuid(),
			"messagedate": moment().format()
		}
		var store = this.getCti(true);
		if (!store) { return details; }
		details.applicationkey = store.schema.metadata.applicationkey.toString();
        if (!store.currentProfile) { return details; }
		details.authtoken = store.currentProfile.token;
		return details;
	}

    // Is there a message of the given operation type already pending?
    // (Used to help us ensure we don't have more than one per type if we need to constrain in that way)
	AppManager.prototype.tracePendingByOperation = function (operation) {
	    var store = this.getCti(true);
	    if (!store || !store.messageTrace || store.messageTrace.length == 0) { return false; }

        // THis supposes that messages are deleted from the trace when concluded
	    for (var k in store.messageTrace) {
	        if (store.messageTrace[k].operation == operation) {
	            return true;
	        }
	    }
	    return false;
	}

    // Call this method to help with tracing the state of a message
	AppManager.prototype.traceMessageStart = function (operation, headers) {
	    var store = this.getCti(true);
	    if (!store) { return false; }
	    if (!store.messageTrace) { store.messageTrace = []; }

	    store.messageTrace.push({
	        "time": new Date().getTime(),
	        "operation": operation,
            "messageid": headers.messageid
	    });
	}

    // Call this method to complete tracing of the message
	AppManager.prototype.traceMessageComplete = function (messageid) {
	    return this._traceMessageCompleteByProperty('messageid', messageid);
	}

    // Call this method to complete tracing of the message
	AppManager.prototype.traceMessageCompleteByOperation = function (operation) {
	    return this._traceMessageCompleteByProperty('operation', operation);
	}

	AppManager.prototype._traceMessageCompleteByProperty = function (propertyName, propertyValue) {
	    var store = this.getCti(true);
	    if (!store || !store.messageTrace || store.messageTrace.length == 0) { return false; }
	    for (var k in store.messageTrace) {
	        if (store.messageTrace[k][propertyName] == propertyValue) {
	            store.messageTrace.splice(k, 1);
	            return true;
	        }
	    }
	    return false;
	}

	// Retrieve a keyed item from the app metadata
	AppManager.prototype.getMetadataValue = function(key, defaultValue) {
		var result = defaultValue;
		if (window.cti !== undefined && window.cti.store !== undefined && window.cti.store.schema.metadata !== undefined) {
			result = window.cti.store.schema.metadata[key];
			if (result == undefined || result == '') {
				result = defaultValue;
			}
		}
		logEvent('Retrieve metadata: ' + key + ' = ' + result);
		return result;
	}

	AppManager.prototype.getCti = function(useStore) {
	    var result = (window.cti === undefined) ? undefined : window.cti;
	    if (!result) { return undefined; }
	    return (useStore) ? result.store : result;
	}
	
	AppManager.prototype.saveToDatabase = function (recordKey, recordData, onSuccess, onFail) {
	    var pouch = new PouchDB("InfinityAppManager");
	    pouch.get(recordKey)
            .then(function (doc) {
                // Already have that key, it's an update
                pouch.put({ _id: recordKey, _rev: doc._rev, data: recordData })
                    .then(function (response) {
                        onSuccess(doc._rev);
                    })
                    .catch(function (err) {
                        onFail("Failed to update record", err);
                    });
            })
            .catch(function (err) {
                if (err.status == 404) {
                    pouch.put({ _id: recordKey, data: recordData })
                        .then(function (response) {
                            onSuccess("(new)");
                        })
                        .catch(function (err2) {
                            onFail("Failed to add record", err2);
                        })
                }
                else {
                    onFail("Failed to retrieve record", err);
                }
            })
	}

	AppManager.prototype.loadFromDatabase = function (recordKey, onSuccess, onFail) {
	    var pouch = new PouchDB("InfinityAppManager");
	    pouch.get(recordKey)
            .then(function (doc) {
                onSuccess(doc);
            })
            .catch(function (err) {
                if (err.status == 404) {
                    onFail("Record does not exist", err);
                }
                else {
                    onFail("Failed to retrieve record", err);
                }
            })
	}

	AppManager.prototype.deleteFromDatabase = function (recordKey, onSuccess, onFail) {
	    var pouch = new PouchDB("InfinityAppManager");
	    pouch.get(recordKey)
            .then(function (doc) {
                db.remove(doc._id, doc._rev);
                onSuccess(doc._rev);
            })
            .catch(function (err) {
                if (err.status == 404) {
                    onSuccess("(none)");
                }
                else {
                    onFail("Failed to retrieve record", err);
                }
            })
    }
        
    AppManager.prototype.createTimeList = function() {
        var label;
        var value;
        var counter;
        var list = [];

        var zeroLabel = "00";
        var lowLabel = "15";
        var midLabel = "30";
        var highLabel = "45";

        var minuteValue = 15;

        while(minuteValue < 60) {
            value = minuteValue;

            label = "00:" + value.toString();

            var obj = {
                "label" : label,
                "value" : value
            }

            list.push(obj);

            minuteValue = minuteValue + 15;
        }

        while(minuteValue < 120) {
            value = minuteValue;

            if(value === 60) {
                var tempLabel = zeroLabel;
            } else if(value === 75) {
                var tempLabel = lowLabel;
            } else if(value === 90) {
                var tempLabel = midLabel;
            } else if(value === 105) {
                var tempLabel = highLabel;
            }

            label = "01:" + tempLabel;

            var obj = {
                "label" : label,
                "value" : value
            }

            list.push(obj);

            minuteValue = minuteValue + 15;
        }


        var obj = {
            "label" : "02:00",
            "value" : minuteValue
        }

        list.push(obj);
        minuteValue = minuteValue + 30;

        var obj = {
            "label" : "02:30",
            "value" : minuteValue
        }

        list.push(obj);
        minuteValue = minuteValue + 30;

        var obj = {
            "label" : "03:00",
            "value" : minuteValue
        }

        list.push(obj);
        minuteValue = minuteValue + 30;

        var obj = {
            "label" : "03:30",
            "value" : minuteValue
        }

        list.push(obj);
        minuteValue = minuteValue + 30;

        var obj = {
            "label" : "04:00",
            "value" : minuteValue
        }

        list.push(obj);
        minuteValue = minuteValue + 60;

        while(minuteValue <= 480) {
            value = minuteValue;

            if(value === 300) {
                label = "05:00";
            } else if(value === 360) {
                label = "06:00";
            } else if(value === 420) {
                label = "07:00";
            } else if(value === 480) {
                label = "08:00";
            }

            var obj = {
                "label" : label,
                "value" : value
            }

            list.push(obj);

            minuteValue = minuteValue + 60;
        }

        window.cti.store.staticData.estimatedTimeSlots = list;
    }

    AppManager.prototype.loadCamera = function(page, componentInstanceId) {
        window.cti.utils.callAction("call-component-function", { 
            "page" : page,
            "componentInstanceId": componentInstanceId,
            "function":"takePhoto"
        });
    }

    AppManager.prototype.repackageSchema = function() {
        window.cti.utils.callAction("call-component-function", { 
            "page" : page,
            "componentInstanceId": componentInstanceId,
            "function":"takePhoto"
        });
    }

    return AppManager;
}());

function setStatusBarColor() {
    if (!window.device) {
        return false;
    }
    StatusBar.show();
    StatusBar.styleLightContent();
    StatusBar.backgroundColorByHexString("#dc4f10");
}

function startAppManager() {
    console.log("Starting appManager");
    setStatusBarColor();
	
	window.appManager = new AppManager();
	setTimeout(window.appManager.pollingMonitor, 100);
}

if (!window.device) {
    console.log("No device, manually start appManager");
    window.setTimeout(function () {
		startAppManager();
    }, 500);
}

document.removeEventListener('deviceready', startAppManager);
document.addEventListener('deviceready', startAppManager, true);

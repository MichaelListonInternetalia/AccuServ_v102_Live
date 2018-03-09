var AccuServFunctions = (function () {
    function AccuServFunctions() {
        window.appManager.logEvent("Starting application. AccuServFunctions 0.2.0");
    }

	AccuServFunctions.prototype.fnLogout = function() {
        var outstandingData = false;
        var cti = window.cti;
        
        if(cti.store.jobs.failedJobs.length > 0 || cti.store.jobs.failedPhotos.length > 0) {
          outstandingData = true;
        }
        
        if(!outstandingData) {
          delete cti.store.variables.lastPage;
          delete cti.store.variables.jobStarted;
          delete cti.store.variables.lastJobHistoryPage;
          delete cti.store.variables.lastJobMapPage;
          delete cti.store.variables.lastSORPage;
          delete cti.store.variables.lastVanStockPage;
          delete cti.store.variables.confirmJobComplete;
          delete cti.store.variables.lastSORSelectPage;
          delete cti.store.variables.lastVanSelectPage;
          delete cti.store.variables.menuOption;
          delete cti.store.variables.selectedLocation;
          delete cti.store.variables.sorCodeJobSearchResults;
          delete cti.store.variables.vanStockJobSearchResults;
          delete cti.store.variables.specialOrder;
          delete cti.store.variables.lastOTCStockPage;
          delete cti.store.variables.otcStockJobSearchResults;
          delete cti.store.variables.selectedJobId;
          delete cti.store.variables.jobDetailToFetch;
          delete cti.store.variables.jobLocations;
          delete cti.store.variables.reSyncJobList;
          delete cti.store.variables.showFullLocations;
          delete cti.store.variables.sorNav;
          delete cti.store.variables.vanNav;
          delete cti.store.variables.estimatedOverrideSelected;
          delete cti.store.variables.estimatedOverride;
          delete cti.store.variables.showFullJobs;
          delete cti.store.variables.successLogin;
          delete cti.store.variables.exceededBand;
        
          delete cti.store.payloads.startOfDayPayload;
          delete cti.store.payloads.jobPayload;
          delete cti.store.payloads.riskAssessmentPayload;
          delete cti.store.payloads.timeSlotsPayload;
        
          delete cti.store.jobs.locationsOTCStock;
          delete cti.store.jobs.selectedJob;
          delete cti.store.jobs.followOnTimeSlots;
        
          delete cti.store.currentProfile;
        
          cti.utils.destroyPageData('VehicleChecks');
          cti.utils.destroyPageData('AccessDetail');
          cti.utils.destroyPageData('Completion');
          cti.utils.destroyPageData('CustomerSignature');
          cti.utils.destroyPageData('FollowOnAppointment');
          cti.utils.destroyPageData('FollowOnContinued');
          cti.utils.destroyPageData('JobInformation');
          cti.utils.destroyPageData('PreWorkPhotos');
          cti.utils.destroyPageData('JobInformation');
          cti.utils.destroyPageData('PostWorkPhotos');
          cti.utils.destroyPageData('NoAccess');
          cti.utils.destroyPageData('RiskAssessment');
          cti.utils.destroyPageData('SpecialPurchases');
          cti.utils.destroyPageData('StartingWork');
          cti.utils.destroyPageData('JobList');
        
          cti.utils.callAction('go-to-page', { "name": "Login" });
        } else {
          cti.utils.callAction(
            "show-notification", {
              "name" : "app_logout",
              "item-type" : "app-notification",
              "style" : "error",
              "title" : "Warning: Outstanding data still on device.",
              "text" : "You still have job data on your device that has not been synced back up to AccuServ. Please connect to the internet and wait for this data to sync before logging out."
            }
          );
        }
        
        if (typeof this.$success === "function") { this.$success(); }
    }
    
    AccuServFunctions.prototype.fnLocaleTimeString = function(date) {
        if (date === undefined) {
            return "(na)";
        }
        
        var d1 = (typeof date === "string") ? new Date(date) : date;
        return d1.toLocaleTimeString();
    }
    
    AccuServFunctions.prototype.fnTimedOutLogout = function() {
        var cti = window.cti;

        cti.store.variables.timedOut = true;
        cti.store.variables.lastPage = cti.store.state.currentPage;
        
        cti.utils.callAction('go-to-page', { "name": "Login" });
        if (typeof this.$success === "function") { this.$success(); }
    }
    
    AccuServFunctions.prototype.fnInitialiseModel = function() {
        var cti = window.cti;
        
        if(!cti.store.jobs) {
            cti.store.jobs = {};
        }
        if(!cti.store.jobs.failedPhotos) {
            cti.store.jobs.failedPhotos = [];
        }
        if(!cti.store.jobs.failedJobs) {
            cti.store.jobs.failedJobs = [];
        }
        if(!cti.store.jobs.jobList) {
            cti.store.jobs.jobList = [];
        }
        if (cti.store.jobs.jobDetails === undefined) {
            cti.store.jobs.jobDetails = [];
        }
        if(cti.store.staticData === undefined) { 
            cti.store.staticData = {}; 
        }
        if(cti.store.pages.VehicleChecks == undefined) { 
            cti.store.pages.VehicleChecks = {}; 
        }
        if (cti.store.payloads === undefined) {
            cti.store.payloads = {};
        }
        if(!cti.store.offlineApi) {
            cti.store.offlineApi = {};
        }
        if(!cti.store.offlineApi.AccuServOffline) {
            cti.store.offlineApi.AccuServOffline = {};
        }
        if (!cti.store.variables.apiHeaders) {
            cti.store.variables.apiHeaders = {};
        }
    }
    
    AccuServFunctions.prototype.fnDataDestroy = function() {
        var cti = window.cti;

        delete cti.store.variables.lastPage;
        delete cti.store.variables.jobStarted;
        delete cti.store.variables.lastJobHistoryPage;
        delete cti.store.variables.lastJobMapPage;
        delete cti.store.variables.lastSORPage;
        delete cti.store.variables.lastVanStockPage;
        delete cti.store.variables.confirmJobComplete;
        delete cti.store.variables.lastSORSelectPage;
        delete cti.store.variables.lastVanSelectPage;
        delete cti.store.variables.menuOption;
        delete cti.store.variables.selectedLocation;
        delete cti.store.variables.sorCodeJobSearchResults;
        delete cti.store.variables.vanStockJobSearchResults;
        delete cti.store.variables.vanStockSearchResults;
        delete cti.store.variables.specialOrder;
        delete cti.store.variables.specialPurchase;
        delete cti.store.variables.sorCodeSearchResults;
        delete cti.store.variables.jobSummaryLastPage;
        delete cti.store.variables.jobDetailToFetch;
        delete cti.store.variables.locationsOTCStock;
        delete cti.store.variables.lastOTCStockPage;
        delete cti.store.variables.lastPOPage;
        delete cti.store.variables.otcStockJobSearchResults;
        delete cti.store.variables.selectedJobId;
        delete cti.store.variables.pendingJobDetailToFetch;
        delete cti.store.variables.jobLocations;
        delete cti.store.variables.showFullLocations;
        delete cti.store.variables.sorNav;
        delete cti.store.variables.vanNav;
        delete cti.store.variables.poNav;
        delete cti.store.variables.estimatedOverrideSelected;
        delete cti.store.variables.estimatedOverride;
        delete cti.store.variables.poRaised;
        delete cti.store.variables.poStock;
        delete cti.store.variables.supplierOTCFilter;
        delete cti.store.variables.fromPhotoDetail;
        delete cti.store.variables.jobCollectionType;
        delete cti.store.variables.jobDataCollectionHeaders;
        delete cti.store.variables.noVanStock;
        delete cti.store.variables.selectedPhoto;
        delete cti.store.variables.selectedPhotoList;
        delete cti.store.variables.sendEventStatusHeaders;
        delete cti.store.variables.validateJobHeaders;
        delete cti.store.variables.supportInfoLastPage;
        delete cti.store.variables.jobEventStatus;
        delete cti.store.variables.exceededBand;
        
        delete cti.store.payloads.startOfDayPayload;
        delete cti.store.payloads.jobPayload;
        delete cti.store.payloads.riskAssessmentPayload;
        delete cti.store.payloads.timeSlotsPayload;
        
        delete cti.store.jobs.selectedJob;
        delete cti.store.jobs.followOnTimeSlots;
        //delete cti.store.jobs.locationsVanStock;
        //delete cti.store.jobs.locationsOTCStock;
        //delete cti.store.jobs.jobSORLocations;
        delete cti.store.jobs.expectedDurationData;
        delete cti.store.jobs.eventStatus;
        delete cti.store.jobs.eventStatusLimit;
        
        cti.utils.destroyPageData('AccessDetail');
        cti.utils.destroyPageData('VehicleChecks');
        cti.utils.destroyPageData('Completion');
        cti.utils.destroyPageData('CustomerSignature');
        cti.utils.destroyPageData('FollowOnAppointment');
        cti.utils.destroyPageData('FollowOnContinued');
        cti.utils.destroyPageData('JobInformation');
        cti.utils.destroyPageData('PreWorkPhotos');
        cti.utils.destroyPageData('JobInformation');
        cti.utils.destroyPageData('PostWorkPhotos');
        cti.utils.destroyPageData('NoAccess');
        cti.utils.destroyPageData('RiskAssessment');
        cti.utils.destroyPageData('SpecialPurchases');
        cti.utils.destroyPageData('StartingWork');
        cti.utils.destroyPageData('StartTravel');
        cti.utils.destroyPageData('ArrivedOnSite');
        cti.utils.destroyPageData('RaiseIncident');
        cti.utils.destroyPageData('RequestJob');
    }

    AccuServFunctions.prototype.fnClearJobData = function() {
        var cti = window.cti;

        window.accuServFunctions.fnDataDestroy();
        
        var jobs = [];
        cti.store.variables.showFullJobs = false;
        
        for(var i in cti.store.jobs.jobList) {
          if(i == "0" || i == "1") {
            jobs.push(cti.store.jobs.jobList[i]);
          }
        }
        
        cti.store.jobs.jobListShort = JSON.parse(JSON.stringify(jobs));
        
        cti.utils.callAction('go-to-page', { "name": "JobList" });
    }

    AccuServFunctions.prototype.fnUpdateAuthToken = function(newToken, expirySeconds) {
        var cti = window.cti;

        // Set the flags so nothing should interfere at this point
        cti.store.currentProfile.refreshingToken = true;
        cti.store.currentProfile.tokenAutoRefreshDue = undefined;

        // No variable ttl support sadly, assign this to same value as TTL used by offline refreshtoken operation
        var ttlUsedByAPICall = 5;

        // Log the time our token expires so we can monitor against it
        var tokenExpiry = new Date();
        tokenExpiry.setSeconds(tokenExpiry.getSeconds() + expirySeconds);

        if (cti.store.currentProfile.maxLoginDurationExpiry !== undefined) {
            // Don't trigger auto-refresh if it'll interfere with the session max duration or is not sufficiently greater than TTL for the update operation
            if (tokenExpiry > cti.store.currentProfile.maxLoginDurationExpiry) {
                window.appManager.logEvent('New auth token assigned. Session due to end within current token validity.', 'info');
            }
            else if (expirySeconds > (ttlUsedByAPICall*2)) {
                var refreshDueSecondsFromNow = (expirySeconds-(ttlUsedByAPICall*60));

                // Arbitrary reduction in the time we start the request for a new token to account for polling interval etc
                refreshDueSecondsFromNow = refreshDueSecondsFromNow - 3;

                var refreshTokenTime = new Date();
                refreshTokenTime.setSeconds(refreshTokenTime.getSeconds() + refreshDueSecondsFromNow);

                cti.store.currentProfile.tokenAutoRefreshDue = refreshTokenTime;

                window.appManager.logEvent('New auth token assigned. Expires at: '+ window.accuServFunctions.fnLocaleTimeString(tokenExpiry) + '; refreshing at: ' + window.accuServFunctions.fnLocaleTimeString(refreshTokenTime), 'debug');
            }
            else {
                window.appManager.logEvent('New auth token assigned. Default session too short for auto-refresh.', 'info');
            }
        }
        else {
            window.appManager.logEvent('New auth token assigned.', 'debug');
        }

        cti.store.currentProfile.token = newToken;
        cti.store.currentProfile.expiryTime = tokenExpiry;
        // A flag to indicate that we're in the process of fetching a new token (offline call)
        // Don't try and get one if this flag == true
        cti.store.currentProfile.refreshingToken = false;
    }

    AccuServFunctions.prototype.fnMapExportJobList = function(currentJobList) {
        var returnedList = { "jobs" : [] };
        
        if(currentJobList == undefined) currentJobList = [];
        
        if(currentJobList.length > 0) {
          for(var i in currentJobList) {
            var thisJob = currentJobList[i];
            var obj = { 
              "aJobID" : thisJob.aAccuServJobID,
              "sStatus" : thisJob.sStatus,
              "aKeyValuePair" : []
            }
            
            returnedList.jobs.push(obj);
          }
        }
        
        return returnedList;
    }

    return AccuServFunctions;
}());

function startAccuServFunctions() {
	window.accuServFunctions = new AccuServFunctions();
}

if (!window.device) {
    console.log("No device, manually start AccuServFunctions");
    window.setTimeout(function () {
		startAccuServFunctions();
    }, 500);
}

document.removeEventListener('deviceready', startAccuServFunctions);
document.addEventListener('deviceready', startAccuServFunctions, true);

export const addSentRequest = (userId: string) => {
    const sentRequests = JSON.parse(localStorage.getItem("sentRequests") || "[]");
    if (!sentRequests.includes(userId)) {
      sentRequests.push(userId);
      localStorage.setItem("sentRequests", JSON.stringify(sentRequests));
    }
  };
  
export const removeSentRequest = (userId: string) => {
    const sentRequests = JSON.parse(localStorage.getItem("sentRequests") || "[]");
    const updatedRequests = sentRequests.filter((id: string) => id !== userId);
    localStorage.setItem("sentRequests", JSON.stringify(updatedRequests));
  };
  
export const isRequestSent = (userId: string) => {
    const sentRequests = JSON.parse(localStorage.getItem("sentRequests") || "[]");
    return sentRequests.includes(userId);
  };
  
export const getSentRequests = (): string[] => {
    return JSON.parse(localStorage.getItem("sentRequests") || "[]");
  };
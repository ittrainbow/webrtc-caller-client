import { makeObservable, observable, action } from 'mobx'

import { iceServers } from '../helpers'

export const mediaStore = () => {
  const userMediaRef = {}
  const store = makeObservable(
    {
      peersStore: {},
      userMediaStore: {},
      peerMediaStore: {},

      setUserMedia(data) {
        console.log(4, data)
        this.userMediaStore = data
      },

      newConnection: (peer) => {
        console.log('new connection', peer)
        this.peersStore[peer] = new RTCPeerConnection({ iceServers })
      }
    },
    {
      peersStore: observable,
      userMediaStore: observable,
      peerMediaStore: observable,
      setUserMedia: action.bound
    }
  )

  return store
}

import { Component, Input, OnInit } from '@angular/core'
import { FormReactive } from '@app/shared/forms/form-reactive'
import {
  FormValidatorService,
  UserValidatorsService
} from '@app/shared/forms/form-validators'

@Component({
  selector: 'my-remote-subscribe',
  templateUrl: './remote-subscribe.component.html',
  styleUrls: ['./remote-subscribe.component.scss']
})
export class RemoteSubscribeComponent extends FormReactive implements OnInit {
  @Input() account: string
  @Input() interact = false
  @Input() showHelp = false

  constructor (
    protected formValidatorService: FormValidatorService,
    private userValidatorsService: UserValidatorsService
  ) {
    super()
  }

  ngOnInit () {
    this.buildForm({
      text: this.userValidatorsService.USER_EMAIL
    })
  }

  onValidKey () {
    this.check()
    if (!this.form.valid) return

    this.formValidated()
  }

  formValidated () {
    const address = this.form.value['text']
    const [ username, hostname ] = address.split('@')

    fetch(`https://${hostname}/.well-known/webfinger?resource=acct:${username}@${hostname}`)
      .then(response => response.json())
      .then(data => new Promise((resolve, reject) => {
        if (data && Array.isArray(data.links)) {
          const link: {
            template: string
          } = data.links.find((link: any) =>
            link && typeof link.template === 'string' && link.rel === 'http://ostatus.org/schema/1.0/subscribe')

          if (link && link.template.includes('{uri}')) {
            resolve(link.template.replace('{uri}', `acct:${this.account}`))
          }
        }
        reject()
      }))
      .then(window.open)
      .catch(() => window.open(`https://${hostname}/authorize_interaction?acct=${this.account}`))
  }
}

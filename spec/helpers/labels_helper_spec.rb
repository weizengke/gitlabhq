require 'spec_helper'

describe LabelsHelper do
  describe 'link_to_label' do
    let(:project) { create(:empty_project) }
    let(:label) { create(:label, project: project) }

    context 'without subject' do
      it "uses the label's project" do
        expect(link_to_label(label)).to match %r{<a href="/#{label.project.path_with_namespace}/issues\?label_name%5B%5D=#{label.name}">.*</a>}
      end
    end

    context 'with a project as subject' do
      let(:namespace) { build(:namespace, name: 'foo3') }
      let(:another_project) { build(:empty_project, namespace: namespace, name: 'bar3') }

      it 'links to project issues page' do
        expect(link_to_label(label, subject: another_project)).to match %r{<a href="/foo3/bar3/issues\?label_name%5B%5D=#{label.name}">.*</a>}
      end
    end

    context 'with a group as subject' do
      let(:group) { build(:group, name: 'bar') }

      it 'links to group issues page' do
        expect(link_to_label(label, subject: group)).to match %r{<a href="/groups/bar/issues\?label_name%5B%5D=#{label.name}">.*</a>}
      end
    end

    context 'with a type argument' do
      ['issue', :issue, 'merge_request', :merge_request].each do |type|
        context "set to #{type}" do
          it 'links to correct page' do
            expect(link_to_label(label, type: type)).to match %r{<a href="/#{label.project.path_with_namespace}/#{type.to_s.pluralize}\?label_name%5B%5D=#{label.name}">.*</a>}
          end
        end
      end
    end

    context 'with a tooltip argument' do
      context 'set to false' do
        it 'does not include the has-tooltip class' do
          expect(link_to_label(label, tooltip: false)).not_to match %r{has-tooltip}
        end
      end
    end

    context 'with block' do
      it 'passes the block to link_to' do
        link = link_to_label(label) { 'Foo' }
        expect(link).to match('Foo')
      end
    end

    context 'without block' do
      it 'uses render_colored_label as the link content' do
        expect(self).to receive(:render_colored_label)
          .with(label, tooltip: true).and_return('Foo')
        expect(link_to_label(label)).to match('Foo')
      end
    end
  end

  describe 'text_color_for_bg' do
    it 'uses light text on dark backgrounds' do
      expect(text_color_for_bg('#222E2E')).to eq('#FFFFFF')
    end

    it 'uses dark text on light backgrounds' do
      expect(text_color_for_bg('#EEEEEE')).to eq('#333333')
    end

    it 'supports RGB triplets' do
      expect(text_color_for_bg('#FFF')).to eq '#333333'
      expect(text_color_for_bg('#000')).to eq '#FFFFFF'
    end
  end
end

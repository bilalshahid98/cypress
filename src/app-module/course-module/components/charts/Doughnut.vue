<script>
import { Doughnut } from "vue-chartjs";

export default {
  extends: Doughnut,
  props: ["value", "backgroundColor"],
  data: () => ({
    chartdata: {
      labels: ["A"],
      datasets: [
        {
          label: "Data One",
          data: [0]
        }
      ]
    },
    options: {
      legend: false,
      responsive: true,
      tooltips: {
        enabled: false
      },
      cutoutPercentage: 80
    }
  }),
  mounted() {
    this.renderChart(this.chartdata, this.options);
    this.chartdata = {
      labels: ["Average"],
      datasets: [
        {
          label: "",
          backgroundColor: this.backgroundColor,
          data: this.value
        }
      ]
    };
    this.renderChart(this.chartdata, this.options);
  },
  watch: {
    value: function(val) {
      this.chartdata = {
        labels: ["Average"],
        datasets: [
          {
            label: "",
            backgroundColor: this.backgroundColor,
            data: this.value
          }
        ]
      };
      this.renderChart(this.chartdata, this.options);
    }
  }
};
</script>

<style></style>
